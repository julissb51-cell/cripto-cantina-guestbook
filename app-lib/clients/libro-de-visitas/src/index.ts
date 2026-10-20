import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDYLDNBCQJZZALN4QJRV5YN5MSWOSK6UCLWPA4JY22S3CCDFWNG3VU4K",
  }
} as const

export const Errors = {
  /**
   * Esta dirección ya firmó el libro.
   */
  1: {message:"YaFirmo"},
  /**
   * El mensaje está vacío.
   */
  2: {message:"MensajeVacio"},
  /**
   * El mensaje supera los 140 bytes.
   */
  3: {message:"MensajeMuyLargo"}
}



/**
 * Una firma del libro: quién escribió, qué dejó y cuándo quedó en el ledger.
 */
export interface Entrada {
  autor: string;
  ledger: u32;
  mensaje: string;
  timestamp: u64;
}

export interface Client {
  /**
   * Construct and simulate a firmar transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deja un mensaje firmado. Cada dirección puede firmar una sola vez.
   */
  firmar: ({autor, mensaje}: {autor: string, mensaje: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Entrada>>>

  /**
   * Construct and simulate a listar transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Devuelve todas las firmas, de la más antigua a la más reciente.
   */
  listar: (options?: MethodOptions) => Promise<AssembledTransaction<Array<Entrada>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAwAAACNFc3RhIGRpcmVjY2nDs24geWEgZmlybcOzIGVsIGxpYnJvLgAAAAAHWWFGaXJtbwAAAAABAAAAGEVsIG1lbnNhamUgZXN0w6EgdmFjw61vLgAAAAxNZW5zYWplVmFjaW8AAAACAAAAIEVsIG1lbnNhamUgc3VwZXJhIGxvcyAxNDAgYnl0ZXMuAAAAD01lbnNhamVNdXlMYXJnbwAAAAAD",
        "AAAABQAAAEhTZSBlbWl0ZSBjYWRhIHZleiBxdWUgYWxndWllbiBkZWphIHN1IGZpcm1hLiBFbCBwcmltZXIgdG9waWMgZXMgYGZpcm1hYC4AAAAAAAAABUZpcm1hAAAAAAAAAQAAAAVmaXJtYQAAAAAAAAIAAAAAAAAABWF1dG9yAAAAAAAAEwAAAAEAAAAAAAAAB21lbnNhamUAAAAAEAAAAAAAAAAA",
        "AAAAAQAAAFBVbmEgZmlybWEgZGVsIGxpYnJvOiBxdWnDqW4gZXNjcmliacOzLCBxdcOpIGRlasOzIHkgY3XDoW5kbyBxdWVkw7MgZW4gZWwgbGVkZ2VyLgAAAAAAAAAHRW50cmFkYQAAAAAEAAAAAAAAAAVhdXRvcgAAAAAAABMAAAAAAAAABmxlZGdlcgAAAAAABAAAAAAAAAAHbWVuc2FqZQAAAAAQAAAAAAAAAAl0aW1lc3RhbXAAAAAAAAAG",
        "AAAAAAAAAENEZWphIHVuIG1lbnNhamUgZmlybWFkby4gQ2FkYSBkaXJlY2Npw7NuIHB1ZWRlIGZpcm1hciB1bmEgc29sYSB2ZXouAAAAAAZmaXJtYXIAAAAAAAIAAAAAAAAABWF1dG9yAAAAAAAAEwAAAAAAAAAHbWVuc2FqZQAAAAAQAAAAAQAAA+kAAAfQAAAAB0VudHJhZGEAAAAAAw==",
        "AAAAAAAAAEFEZXZ1ZWx2ZSB0b2RhcyBsYXMgZmlybWFzLCBkZSBsYSBtw6FzIGFudGlndWEgYSBsYSBtw6FzIHJlY2llbnRlLgAAAAAAAAZsaXN0YXIAAAAAAAAAAAABAAAD6gAAB9AAAAAHRW50cmFkYQA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    firmar: this.txFromJSON<Result<Entrada>>,
        listar: this.txFromJSON<Array<Entrada>>
  }
}