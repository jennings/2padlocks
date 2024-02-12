<script lang="ts">
  import type { SecretRequest } from "$lib/model";

  type Props = {
    request: SecretRequest;
    onSelect: (request: SecretRequest) => void;
    onRemove: (request: SecretRequest) => void;
    selected: boolean;
  };
  let { request, selected, onSelect }: Props = $props();

  function remove() {}
</script>

<li class:selected>
  <button class="name" onclick={() => onSelect(request)}>{request.name}</button>
  <div class="date">{request.created_at}</div>
  <div class="close">
    <button onclick={remove}>(x) Delete</button>
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
