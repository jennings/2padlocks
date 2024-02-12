<script lang="ts">
  import type { Context } from "$lib/encryption";
  import { createContext } from "$lib/encryption";
  import type { SecretRequest } from "$lib/model";
  import { onMount } from "svelte";
  import RequestForm from "./RequestForm.svelte";
  import RequestList from "./RequestList.svelte";
  import type { Writable } from "svelte/store";
  import { persistable } from "$lib/request-store";

  let context: Context | null = $state(null);
  let selected: SecretRequest | null = $state(null);

  let requestList: Writable<readonly SecretRequest[] | null> | null = $state(null);
  onMount(() => {
    requestList = persistable<readonly SecretRequest[]>(window.localStorage, "requests", []);
  });

  function onSelect(request: SecretRequest | null) {
    selected = request;
  }

  onMount(() => {
    createContext().then((ctx) => {
      context = ctx;
    });
  });
</script>

<div class="container">
  {#if context}
    <div class="row">
      <div class="col">
        {#if requestList}
          <RequestList {context} {requestList} {selected} {onSelect} />
        {/if}
      </div>
      {#if selected}
        <RequestForm {context} bind:request={selected} />
      {/if}
    </div>
  {/if}
</div>
