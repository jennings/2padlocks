<script lang="ts">
  import type { SecretRequest } from "$lib/model";
  import { Trash } from "svelte-bootstrap-icons";

  type Props = {
    request: SecretRequest;
    onSelect: (request: SecretRequest) => void;
    onRemove: (request: SecretRequest) => void;
    selected: boolean;
  };
  let { request, selected, onSelect, onRemove }: Props = $props();

  function remove() {
    onRemove(request);
  }
</script>

<li class:selected>
  <button class="name" onclick={() => onSelect(request)}>{request.name}</button>
  <div class="date">{request.created_at}</div>
  <div class="close">
    <button class="btn btn-sm" onclick={remove} aria-label="Delete">
      <Trash />
    </button>
  </div>
</li>

<style>
  li {
    list-style: none;
    display: grid;
    grid-template:
      "name close"
      "date close";
    background: white;

    &.selected {
      background: lightgrey;
    }
  }
  .name {
    grid-area: name;
    border: none;
    background: transparent;
    text-align: left;
    font-weight: bold;
  }
  .date {
    grid-area: date;
  }
  .close {
    grid-area: close;
  }
</style>
