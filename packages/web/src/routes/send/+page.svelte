<script lang="ts">
  import type { Context } from "$lib/encryption";
  import { PublicKey, SealedBox, createContext } from "$lib/encryption";
  import clipboardCopy from "clipboard-copy";
  import { onMount } from "svelte";
  import { Copy, FileLock, Send } from "svelte-bootstrap-icons";

  type Loadable<T> =
    | { state: "loading" }
    | { state: "ready"; value: T }
    | { state: "error"; error: unknown };

  let plaintext = $state("");
  let ciphertext: string | null = $state(null);
  type ReadyData = { context: Context; publicKey: PublicKey };
  let data: Loadable<ReadyData> = $state({ state: "loading" });

  let hasNavigator = $state(false);
  onMount(() => {
    hasNavigator = typeof navigator.share === "function";
  });

  function seal(context: Context, key: PublicKey) {
    const box = SealedBox.seal(context, plaintext, key);
    ciphertext = box.toBase64();
  }

  function onShare() {
    if (ciphertext) {
      navigator.share({ text: ciphertext });
    }
  }

  onMount(async () => {
    const { hash } = window.location;
    const params = new URLSearchParams(hash.slice(1));
    const publicKey = params.get("publicKey");
    const keyType = params.get("keyType");

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
    <p>Encrypt a secret.</p>
    <textarea
      rows="4"
      cols="50"
      value={plaintext}
      oninput={(e) => (plaintext = e.currentTarget.value)}
    ></textarea>
    <button
      class="btn btn-primary"
      onclick={seal.bind(undefined, data.value.context, data.value.publicKey)}
    >
      <FileLock /> Encrypt
    </button>

    <textarea readonly disabled={ciphertext == null} rows="4" cols="50" value={ciphertext}
    ></textarea>
    {#if hasNavigator}
      <button class="btn btn-primary" onclick={onShare} aria-label="Share">
        <Send />
      </button>
    {/if}
    <button
      class="btn btn-outline"
      onclick={clipboardCopy.bind(undefined, ciphertext ?? "")}
      aria-label="Copy to clipboard"
    >
      <Copy />
      Copy to clipboard
    </button>
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
