#![no_std]

use soroban_sdk::{
    Address, Env, String, Vec, contract, contracterror, contractevent, contractimpl, contracttype,
};

mod test;

/// Una nota breve, como las que se dejan en la barra. El límite es en bytes
/// para que el contrato no tenga que contar caracteres Unicode.
const MAX_MENSAJE: u32 = 140;

/// Unos cinco segundos por ledger. El sello de cada firma vive lo bastante
/// como para que la página pueda seguir mostrándolo.
const LEDGERS_PER_DAY: u32 = 17_280;
const TTL_THRESHOLD: u32 = 30 * LEDGERS_PER_DAY;
const TTL_EXTEND_TO: u32 = 90 * LEDGERS_PER_DAY;

#[contract]
pub struct LibroDeVisitas;

/// Una firma del libro: quién escribió, qué dejó y cuándo quedó en el ledger.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Entrada {
    pub autor: Address,
    pub mensaje: String,
    pub ledger: u32,
    pub timestamp: u64,
}

#[contracttype]
enum DataKey {
    Mensajes,
    Firmo(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    /// Esta dirección ya firmó el libro.
    YaFirmo = 1,
    /// El mensaje está vacío.
    MensajeVacio = 2,
    /// El mensaje supera los 140 bytes.
    MensajeMuyLargo = 3,
}

/// Se emite cada vez que alguien deja su firma. El primer topic es `firma`.
#[contractevent(topics = ["firma"], data_format = "single-value")]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Firma {
    #[topic]
    pub autor: Address,
    pub mensaje: String,
}

#[contractimpl]
impl LibroDeVisitas {
    /// Deja un mensaje firmado. Cada dirección puede firmar una sola vez.
    pub fn firmar(env: Env, autor: Address, mensaje: String) -> Result<Entrada, Error> {
        autor.require_auth();

        if mensaje.is_empty() {
            return Err(Error::MensajeVacio);
        }
        if mensaje.len() > MAX_MENSAJE {
            return Err(Error::MensajeMuyLargo);
        }

        let firma_key = DataKey::Firmo(autor.clone());
        if env.storage().persistent().has(&firma_key) {
            return Err(Error::YaFirmo);
        }

        let entrada = Entrada {
            autor: autor.clone(),
            mensaje: mensaje.clone(),
            ledger: env.ledger().sequence(),
            timestamp: env.ledger().timestamp(),
        };

        let mut mensajes: Vec<Entrada> = env
            .storage()
            .instance()
            .get(&DataKey::Mensajes)
            .unwrap_or_else(|| Vec::new(&env));
        mensajes.push_back(entrada.clone());

        env.storage().instance().set(&DataKey::Mensajes, &mensajes);
        env.storage()
            .instance()
            .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);

        env.storage().persistent().set(&firma_key, &true);
        env.storage()
            .persistent()
            .extend_ttl(&firma_key, TTL_THRESHOLD, TTL_EXTEND_TO);

        Firma { autor, mensaje }.publish(&env);

        Ok(entrada)
    }

    /// Devuelve todas las firmas, de la más antigua a la más reciente.
    pub fn listar(env: Env) -> Vec<Entrada> {
        env.storage()
            .instance()
            .get(&DataKey::Mensajes)
            .unwrap_or_else(|| Vec::new(&env))
    }
}
