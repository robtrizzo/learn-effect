import { Data, Effect } from "effect";

interface FetchError {
    readonly _tag: "FetchError";
}
class FetchError extends Data.TaggedError("FetchError")<{}> { }


interface JsonError {
    readonly _tag: "JsonError"
}
class JsonError extends Data.TaggedError("JsonError")<{}> { }


const fetchRequest = Effect.tryPromise({
    try: () => fetch("https://pokeapi.co/api/v2/pokemon/garchomp/"),
    catch: () => new FetchError()
});

const jsonResponse = (response: Response) => Effect.tryPromise({
    try: () => response.json(),
    catch: () => new JsonError()
});

const main = fetchRequest.pipe(
    Effect.filterOrFail(
        (response) => response.ok,
        () => new FetchError()
    ),
    Effect.flatMap(jsonResponse),
    Effect.catchTags({
        FetchError: () => Effect.succeed("Fetch error"),
        JsonError: () => Effect.succeed("Json error"),
    })
)

Effect.runPromise(main);