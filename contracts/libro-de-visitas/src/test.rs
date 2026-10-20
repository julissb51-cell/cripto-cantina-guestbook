#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    Address, Env, IntoVal, String, symbol_short,
    testutils::{Address as _, AuthorizedFunction, Events, Ledger},
    vec,
};

fn client(env: &Env) -> LibroDeVisitasClient<'_> {
    let contract_id = env.register(LibroDeVisitas, ());
    LibroDeVisitasClient::new(env, &contract_id)
}

fn nota(env: &Env, texto: &str) -> String {
    String::from_str(env, texto)
}

fn fijar_ledger(env: &Env, sequence: u32, timestamp: u64) {
    env.ledger().with_mut(|ledger| {
        ledger.sequence_number = sequence;
        ledger.timestamp = timestamp;
    });
}

#[test]
fn el_libro_empieza_en_blanco() {
    let env = Env::default();
    let libro = client(&env);
    assert_eq!(libro.listar().len(), 0);
}

#[test]
fn firmar_guarda_autor_mensaje_ledger_y_timestamp() {
    let env = Env::default();
    env.mock_all_auths();
    let libro = client(&env);
    let alice = Address::generate(&env);
    let mensaje = nota(&env, "La primera ronda va por la casa.");
    fijar_ledger(&env, 42, 1_700_000_000);

    let entrada = libro.firmar(&alice, &mensaje);

    assert_eq!(entrada.autor, alice);
    assert_eq!(entrada.mensaje, mensaje);
    assert_eq!(entrada.ledger, 42);
    assert_eq!(entrada.timestamp, 1_700_000_000);

    let paginas = libro.listar();
    assert_eq!(paginas.len(), 1);
    assert_eq!(paginas.get(0).unwrap(), entrada);
}

#[test]
fn firmar_exige_la_autorizacion_del_autor() {
    let env = Env::default();
    env.mock_all_auths();
    let libro = client(&env);
    let alice = Address::generate(&env);
    let mensaje = nota(&env, "Salud.");

    libro.firmar(&alice, &mensaje);

    let auths = env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, alice);
    assert_eq!(
        auths[0].1.function,
        AuthorizedFunction::Contract((
            libro.address.clone(),
            symbol_short!("firmar"),
            (alice.clone(), mensaje.clone()).into_val(&env),
        ))
    );
    assert_eq!(auths[0].1.sub_invocations, std::vec![]);
}

#[test]
fn sin_autorizacion_firmar_falla() {
    let env = Env::default();
    let libro = client(&env);
    let alice = Address::generate(&env);

    // Nadie autorizó la llamada: `require_auth` tiene que rechazarla.
    assert!(libro.try_firmar(&alice, &nota(&env, "sin firma")).is_err());
    assert_eq!(libro.listar().len(), 0);
}

#[test]
fn otra_direccion_no_puede_firmar_por_ti() {
    let env = Env::default();
    let libro = client(&env);
    let alice = Address::generate(&env);
    let intruso = Address::generate(&env);
    let mensaje = nota(&env, "esto no es mío");

    env.mock_auths(&[soroban_sdk::testutils::MockAuth {
        address: &intruso,
        invoke: &soroban_sdk::testutils::MockAuthInvoke {
            contract: &libro.address,
            fn_name: "firmar",
            args: (alice.clone(), mensaje.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    assert!(libro.try_firmar(&alice, &mensaje).is_err());
    assert_eq!(libro.listar().len(), 0);
}

#[test]
fn la_segunda_firma_de_la_misma_direccion_falla() {
    let env = Env::default();
    env.mock_all_auths();
    let libro = client(&env);
    let alice = Address::generate(&env);

    libro.firmar(&alice, &nota(&env, "primera y única"));

    assert_eq!(
        libro
            .try_firmar(&alice, &nota(&env, "quiero otra"))
            .unwrap_err(),
        Ok(Error::YaFirmo)
    );
    assert_eq!(libro.listar().len(), 1);
}

#[test]
fn dos_direcciones_dejan_dos_mensajes_en_orden() {
    let env = Env::default();
    env.mock_all_auths();
    let libro = client(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    libro.firmar(&alice, &nota(&env, "abrimos la barra"));
    libro.firmar(&bob, &nota(&env, "y yo pido la segunda"));

    let paginas = libro.listar();
    assert_eq!(paginas.len(), 2);
    assert_eq!(paginas.get(0).unwrap().autor, alice);
    assert_eq!(paginas.get(1).unwrap().autor, bob);
    assert_eq!(
        paginas.get(1).unwrap().mensaje,
        nota(&env, "y yo pido la segunda")
    );
}

#[test]
fn rechaza_mensaje_vacio_y_mensaje_demasiado_largo() {
    let env = Env::default();
    env.mock_all_auths();
    let libro = client(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    assert_eq!(
        libro.try_firmar(&alice, &nota(&env, "")).unwrap_err(),
        Ok(Error::MensajeVacio)
    );

    let largo = "a".repeat(141);
    assert_eq!(
        libro.try_firmar(&bob, &nota(&env, &largo)).unwrap_err(),
        Ok(Error::MensajeMuyLargo)
    );

    let justo = "b".repeat(140);
    assert!(libro.try_firmar(&bob, &nota(&env, &justo)).is_ok());
    assert_eq!(libro.listar().len(), 1);
}

#[test]
fn cada_firma_emite_un_evento() {
    let env = Env::default();
    env.mock_all_auths();
    let libro = client(&env);
    let alice = Address::generate(&env);
    let mensaje = nota(&env, "oído en la barra");

    libro.firmar(&alice, &mensaje);

    assert_eq!(
        env.events().all(),
        vec![
            &env,
            (
                libro.address.clone(),
                (symbol_short!("firma"), alice.clone()).into_val(&env),
                mensaje.into_val(&env),
            ),
        ]
    );
}
