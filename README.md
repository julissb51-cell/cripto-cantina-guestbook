# El libro de visitas de la Cripto Cantina

Una dApp de Stellar Sessions, challenge #1. Quien quiera pasa por la barra,
conecta su wallet y deja un mensaje firmado en Soroban. La página muestra todas
las firmas.

**En vivo:** https://julissb51-cell.github.io/cripto-cantina-guestbook/

Esa página habla con el contrato de testnet que ya está desplegado. No hace
falta clonar el repo para dejar una firma.

El proyecto salió de Scaffold Stellar (`stellar scaffold init --template react`)
y el contrato es propio.

## Contrato en testnet

**ID:** `CDYLDNBCQJZZALN4QJRV5YN5MSWOSK6UCLWPA4JY22S3CCDFWNG3VU4K`

**Explorador:**
https://stellar.expert/explorer/testnet/contract/CDYLDNBCQJZZALN4QJRV5YN5MSWOSK6UCLWPA4JY22S3CCDFWNG3VU4K

Lo publicó la identidad `deployer`
(`GBXEG2IZJ6NS6HCZTOK65A76UD2PKKH2XYS7QH2C7CNRQSWLBTJMS3PX`). Scaffold Stellar
la creó y Friendbot la fondeó al desplegar con
`stellar scaffold build --network testnet --build-clients`.

`scaffold.yml` apunta la red `testnet` a ese ID, así que el cliente generado no
publica otra instancia.

## Cómo correrlo

Hace falta Rust (el `rust-toolchain.toml` pide 1.93 y el target
`wasm32v1-none`), Node.js 22, la Stellar CLI y Scaffold Stellar:

```bash
cargo install --locked stellar-cli
cargo install --locked stellar-scaffold-cli
```

Con los binarios ya instalados:

```bash
npm install
cp app/.env.example app/.env
npm start
```

`app/.env` deja `STELLAR_NETWORK=testnet`. `npm start` corre
`stellar scaffold watch --build-clients`, que regenera el cliente del contrato
ya desplegado, y abre la app en http://localhost:43117.

En esta versión de la CLI hace falta `--build-clients` para generar el cliente y
publicar. Sin esa bandera, `build` y `watch` solo compilan el Wasm.

Para compilar el frontend sin el modo watch:

```bash
npm run build --workspace app
```

Esa build usa el cliente de testnet ya incluido en `app-lib/clients` (y
`app/.env.production`). No levanta una red local ni publica el contrato. El
resultado queda en `app/dist`, con la base `/cripto-cantina-guestbook/` para
GitHub Pages.

Los tests del contrato:

```bash
cargo test -p libro-de-visitas
```

Cubren firmar, listar (autor, mensaje, ledger y timestamp), `require_auth`, el
rechazo de una segunda firma y el límite de 140 bytes.

## Página en GitHub Pages

https://julissb51-cell.github.io/cripto-cantina-guestbook/

`.github/workflows/pages.yml` construye el frontend en cada push a `main` y lo
publica con GitHub Actions. En el repositorio, Pages tiene que usar el origen
**GitHub Actions** (Settings → Pages → Build and deployment → Source).

## La página

![Libro de visitas leyendo las firmas de testnet](docs/captura-cripto-cantina.png)

Conecta con Freighter u otra wallet del Stellar Wallets Kit, en la red testnet.
Si la cuenta está vacía, **Fondear** le pide XLM a Friendbot. Cada dirección
puede firmar una sola vez: la segunda vez el contrato responde `YaFirmo`.

## El contrato

`contracts/libro-de-visitas`

- `firmar(autor: Address, mensaje: String)` exige `autor.require_auth()`.
- Guarda autor, mensaje, ledger y timestamp, y emite el evento `firma`.
- `listar()` devuelve todas las entradas, de la más antigua a la más reciente.
- Una misma dirección no vuelve a firmar.
- El mensaje no puede ir vacío ni pasar de 140 bytes. Es el recado corto de la
  barra.

Proyecto de Juliana Sanabria para el Challenge #1 de Stellar Sessions
