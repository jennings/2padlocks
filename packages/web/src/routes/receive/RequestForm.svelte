<script lang="ts">
  import type { Context } from "$lib/encryption";
  import { KeyPair, SealedBox } from "$lib/encryption";
  import type { SecretRequest } from "$lib/model";
  import clipboardCopy from "clipboard-copy";
  import type { Toast } from "bootstrap";
  import { onMount } from "svelte";
  import { Copy, Send } from "svelte-bootstrap-icons";

  type Props = {
    request: SecretRequest;
    context: Context;
  };
  let { request = $bindable(), context }: Props = $props();

  let requestUrl = $derived(
    `${window.origin}/send#${new URLSearchParams({
      keyType: request.keyPair.keyType,
      publicKey: request.keyPair.publicKey,
    })}`,
  );

  let ciphertext = $state("");
  let plaintext = $derived(context && ciphertext ? decrypt(context, ciphertext) : "");

  let hasNavigator = $state(false);
  onMount(() => {
    hasNavigator = typeof navigator.share === "function";
  });

  let toastEl: HTMLDivElement;
  let toast: Toast | null = $state(null);
  onMount(async () => {
    const { Toast } = await import("bootstrap");
    toast = new Toast(toastEl);
  });

  function onCopyRequestUrl() {
    clipboardCopy(requestUrl);
    toast?.show();
  }
  function onShare() {
    navigator.share({ text: requestUrl });
  }
  function decrypt(context: Context, ciphertext: string) {
    try {
      const reconstructedBox = SealedBox.fromBase64(context, ciphertext);
      const key = KeyPair.fromStringKeyPair(context, request.keyPair);
      return reconstructedBox.open(context, key, "text");
    } catch (err) {
      return "Unable to decrypt";
    }
  }
</script>

<div class="col">
  <h2>Create request</h2>
  <div class="row g-3">
    <div class="col-12">
      <label for="keyType" class="form-label">Name</label>
      <input class="form-control" name="name" bind:value={request.name} />
    </div>
    <div class="col-12">
      <label class="form-label" for="requestUrl">Request URL</label>
      <input class="form-control" readonly name="requestUrl" value={requestUrl} /> <br />
      {#if hasNavigator}
        <button class="btn btn-primary float-start" onclick={onShare} aria-label="Share">
          <Send />
        </button>
      {/if}
      <button
        class="btn btn-primary float-start"
        onclick={onCopyRequestUrl}
        aria-label="Copy to clipboard"
      >
        <Copy />
      </button>
      <a target="_blank" href={requestUrl}>Open in new window</a>
      <div aria-live="polite" aria-atomic="true" class="position-relative">
        <div class="toast-container position-absolute p-3" id="toastPlacement">
          <div
            bind:this={toastEl}
            class="toast"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div class="toast-body">Copied to clipboard</div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 accordion" id="nerdData">
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button
            class="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#requestNerdData"
            aria-expanded="false"
            aria-controls="requestNerdData"
          >
            Data for nerds
          </button>
        </h2>
        <div class="accordion-collapse collapse" id="requestNerdData" data-bs-parent="#nerdData">
          <div class="accordion-body row g-3">
            <div class="col-12">
              <label class="form-label" for="keyType">Key type</label>
              <input class="form-control" readonly name="keyType" value={request.keyPair.keyType} />
            </div>
            <div class="col-12">
              <label class="form-label" for="keyType">Public key</label>
              <input
                class="form-control"
                readonly
                name="publicKey"
                value={request.keyPair.publicKey}
              />
            </div>
            <div class="col-12">
              <label class="form-label" for="keyType">Private key</label>
              <input
                class="form-control"
                readonly
                name="privateKey"
                value={request.keyPair.privateKey}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="col">
  <h2>Decrypt response</h2>
  <label
    >Ciphertext <br />
    <textarea
      rows="4"
      cols="50"
      value={ciphertext}
      oninput={(e) => (ciphertext = e.currentTarget.value)}
    ></textarea>
  </label>
  <br />
  {#if plaintext}
    <label
      >Plaintext <br />
      <textarea rows="4" cols="50" readonly value={plaintext}></textarea>
    </label>
  {/if}
</div>
