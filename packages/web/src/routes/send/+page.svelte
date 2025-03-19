<script lang="ts">
  import type { Context } from "$lib/encryption";
  import { PublicKey, SealedBox, createContext } from "$lib/encryption";
  import clipboardCopy from "clipboard-copy";
  import { onMount } from "svelte";

  type Loadable<T> =
    | { state: "loading" }
    | { state: "ready"; value: T }
    | { state: "error"; error: unknown };

  let plaintext = "";
  let ciphertext: string | null = "";
  type ReadyData = { context: Context; publicKey: PublicKey };
  let data: Loadable<ReadyData> = { state: "loading" };
  let recipient: string | null;

  function seal(context: Context, key: PublicKey) {
    const box = SealedBox.seal(context, plaintext, key);
    ciphertext = box.toBase64();
  }

  onMount(async () => {
    const { hash } = window.location;
    const params = new URLSearchParams(hash.slice(1));
    const publicKey = params.get("publicKey");
    const keyType = params.get("keyType");
    recipient = params.get("recipient");

    if (publicKey == null || keyType == null) {
      const missingNames = [!publicKey && "publicKey", !keyType && "keyType"]
        .filter(Boolean)
        .join(",");
      data = { state: "error", error: new Error(`Missing ${missingNames} from hash`) };
    } else {
      try {
        const context = await createContext();
        const pk = PublicKey.fromStringPublicKey(context, { keyType, publicKey });
        data = {
          state: "ready",
          value: {
            context,
            publicKey: pk,
          },
        };
      } catch (error) {
        data = { state: "error", error };
      }
    }
  });
</script>

{#if data.state === "ready"}
  <div class="container">
    <p>
      Encrypt a secret{#if recipient}
        to {recipient}{/if}.
    </p>
    <textarea
      rows="4"
      cols="50"
      value={plaintext}
      on:input={(e) => (plaintext = e.currentTarget.value)}
    ></textarea>
    <button on:click={seal.bind(undefined, data.value.context, data.value.publicKey)}>
      Encrypt
    </button>

    {#if ciphertext != null}
      <textarea readonly rows="4" cols="50" value={ciphertext}></textarea>
      <button on:click={clipboardCopy.bind(undefined, ciphertext)}>Copy</button>
    {/if}
  </div>
{:else if data.state === "error"}
  <p>
    Load error: {data.error}
  </p>
{/if}

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
</style>
