<script lang="ts">
  import type { Context } from "$lib/encryption";
  import { KeyPair, SealedBox } from "$lib/encryption";
  import type { SecretRequest } from "$lib/model";
  import clipboardCopy from "clipboard-copy";

  type Props = {
    request: SecretRequest;
    context: Context;
  };
  let { request = $bindable(), context }: Props = $props();

  let requestUrl = $derived(
    `${window.origin}/#${new URLSearchParams({
      keyType: request.keyPair.keyType,
      publicKey: request.keyPair.publicKey,
    })}`,
  );

  let ciphertext = $state("");
  let plaintext = $derived(context && ciphertext ? decrypt(context, ciphertext) : "");

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
  <div class="container">
    <div class="row">
      <div class="col">
        <label for="keyType">Name</label>
      </div>
      <div class="col">
        <input readonly name="name" bind:value={request.name} />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label for="keyType">Key type </label>
      </div>
      <div class="col">
        <input readonly name="keyType" value={request.keyPair.keyType} />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label for="keyType">Public key</label>
      </div>
      <div class="col">
        <input readonly name="publicKey" value={request.keyPair.publicKey} />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label for="keyType">Private key</label>
      </div>
      <div class="col">
        <input readonly name="privateKey" value={request.keyPair.privateKey} />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label for="requestUrl">Request URL</label>
      </div>
      <div class="col">
        <input readonly name="requestUrl" value={requestUrl} /> <br />
        <button onclick={clipboardCopy.bind(undefined, requestUrl)}>Copy</button> <br />
        <a target="_blank" href={requestUrl}>Open in new window</a>
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
