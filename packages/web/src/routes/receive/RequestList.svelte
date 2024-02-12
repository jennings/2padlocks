<script lang="ts">
  import { KeyPair, type Context } from "$lib/encryption";
  import type { SecretRequest } from "$lib/model";
  import type { Writable } from "svelte/store";
  import RequestListItem from "./RequestListItem.svelte";

  type Props = {
    selected: SecretRequest | null;
    requestList: Writable<readonly SecretRequest[] | null>;
    onSelect: (request: SecretRequest | null) => void;
    context: Context;
  };

  let { context, requestList, selected, onSelect }: Props = $props();

  function create() {
    console.log("here");
    const keyPair = KeyPair.generate(context);
    const request: SecretRequest = {
      name: "New request",
      created_at: new Date().toISOString(),
      keyPair: keyPair.toStringKeyPair(),
    };
    console.log("here");
    requestList.update((requests) => [...(requests ?? []), request]);
    onSelect(request);
    console.log("here");
  }

  function onRemove(request: SecretRequest) {
    requestList.update((requests) => requests?.filter((r) => r !== request) ?? []);
    if (selected === request) {
      onSelect(null);
    }
  }
</script>

<div>
  <button onclick={create}>+ Add</button>
  <ul>
    {#each $requestList ?? [] as request}
      <RequestListItem
        {request}
        selected={selected?.keyPair.privateKey === request.keyPair.privateKey}
        {onSelect}
        {onRemove}
      />
    {/each}
  </ul>
</div>

<style lang="scss">
  ul {
    list-style: none;
    padding: 0;
    background: grey;

    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  ul > RequestListItem {
    background: white;
  }
  button {
    margin-bottom: 1rem;
  }
</style>
