<script setup lang="ts">
import Spinner from "@/components/Spinner.vue";
import {
  filterer,
  sorter,
  allFilters,
  allSorts,
  formatSort,
  type TodoItemFilter,
  type TodoItemSort,
} from "@/shared";
import { formatFromNow } from "@/utils";
import { computed, onMounted, ref, watch } from "vue";
import { useTodoItems } from "./todo-item-composable";

const {
  todoItems,
  statusDelete,
  statusGet,
  statusPatch,
  statusPost,
  delete_,
  get,
  patch,
  post,
} = useTodoItems();

const text = ref("");
const filter = ref<TodoItemFilter>("All");
const sort = ref<TodoItemSort>("NewestFirst");

//
const visibleItems = computed(() => {
  return todoItems.value
    .filter(filterer({ filter: filter.value }))
    .sort(sorter({ sort: sort.value }));
});

watch(visibleItems, () => {});

onMounted(() => {
  get({
    filter: filter.value,
    sort: sort.value,
  });
});

watch([statusPost, statusDelete, statusPatch, filter, sort], () => {
  get({
    filter: filter.value,
    sort: sort.value,
  });
});
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <div class="w-full bg-inherit top-0 p-4">
      <div class="flex items-center justify-center gap-2 w-full">
        <input
          v-model="text"
          class="input input-md input-bordered flex-1 input-primary"
          :class="{
            'input-error': statusPost.type === 'Failure',
          }"
          placeholder="What todo?"
        />

        <button
          @click="post({ text: text })"
          class="btn btn-primary w-32"
          :class="{ loading: statusPost.type === 'Loading' }"
        >
          Submit
        </button>
      </div>

      <p class="py-2 text-sm text-red-500">
        {{ statusPost.type === "Failure" ? statusPost.error : "" }}
      </p>

      <div class="btn-group mb-4">
        <button
          v-for="someFiler in allFilters"
          v-bind:key="someFiler"
          :class="{ 'btn-active': someFiler === filter }"
          class="btn btn-sm"
          @click="filter = someFiler"
        >
          {{ someFiler }}
        </button>
      </div>

      <div class="btn-group">
        <button
          v-for="sortItem in allSorts"
          v-bind:key="sortItem"
          :class="{ 'btn-active': sortItem === sort }"
          class="btn btn-sm"
          @click="sort = sortItem"
        >
          {{ formatSort(sortItem) }}
        </button>
      </div>
    </div>

    <div class="flex flex-col items-center justify-center flex-1 w-full pb-16">
      <div class="px-4 w-full">
        <div
          v-if="statusGet.type === 'Failure'"
          class="alert alert-error shadow-lg"
        >
          {{ statusGet.type === "Failure" ? statusGet.error : "" }}
        </div>
      </div>

      <p
        v-if="(visibleItems.length = 0)"
        class="opacity-75 h-64 text-xl font-bold flex items-center justify-center"
      >
        {{
          visibleItems.length === 0
            ? "There is nothing todo"
            : filter === "Active"
            ? "All items are completed"
            : filter === "Completed"
            ? "No items are completed"
            : "There is nothing todo."
        }}
      </p>

      <ol class="flex flex-col items-center justify-center w-full relative">
        <li
          v-for="item in visibleItems"
          v-bind:key="item.id"
          class="inner w-full flex items-center pr-6"
        >
          <div
            class="flex-1 flex items-center p-4 pl-6"
            :class="{
              'cursor-wait': statusPatch.type === 'Loading',
              'cursor-pointer active:bg-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700':
                statusPatch.type !== 'Loading',
              'opacity-50':
                statusPatch.type === 'Loading' &&
                statusPatch.params.itemId === item.id,
            }"
            @click="
              patch({ itemId: item.id }, { isCompleted: !item.isCompleted })
            "
          >
            <input
              type="checkbox"
              :checked="item.isCompleted"
              class="checkbox checkbox-sm checkbox-primary mr-2"
              @click.prevent=""
            />

            <div class="flex-1">
              <p
                class="text-lg font-semibold"
                :class="{
                  'line-through opacity-50': item.isCompleted,
                }"
              >
                {{ item.text }}
              </p>
              <p
                class="text-xs opacity-75"
                :class="{
                  'line-through opacity-50': item.isCompleted,
                }"
              >
                {{ formatFromNow(item.createdAt) }}
              </p>
            </div>
          </div>
          <button
            class="btn btn-outline btn-error btn-xs"
            :class="{
              'loading cursor-wait':
                statusDelete.type === 'Loading' &&
                statusDelete.params.itemId === item.id,
            }"
            @click="delete_({ itemId: item.id })"
          >
            Delete
          </button>
        </li>
      </ol>

      <Spinner class="p-4" v-if="statusGet.type === 'Loading'" />
    </div>
  </div>
</template>
