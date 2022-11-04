<script setup lang="ts">
import {
  filterer,
  sorter,
  type TodoItemFilter,
  type TodoItemSort,
} from "@/shared";
import { useMutation } from "@/utils/use-mutation";
import { ref } from "vue";
import TodoItemApi from "./todo-item-api";

const text = ref("");
const filter = ref<TodoItemFilter>("All");
const sort = ref<TodoItemSort>("NewestFirst");

const query = useQuery({ queryFn: TodoItemApi.get });
const mutationDelete = useMutation(TodoItemApi.delete);
const mutationPatch = useMutation(TodoItemApi.patch);
const mutationPost = useMutation(TodoItemApi.post);

const allFilters: TodoItemFilter[] = ["All", "Active", "Completed"];
const allSorts: TodoItemSort[] = ["NewestFirst", "OldestFirst"];

const items = query.mapOk([], (items) =>
  items
    .filter(filterer({ filter: filter.value }))
    .sort(sorter({ sort: sort.value }))
);
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <div class="w-full bg-inherit top-0 p-4">
      <div class="flex items-center justify-center gap-2 w-full">
        <input
          ref="text"
          v-model="text"
          class="input input-md input-bordered flex-1 input-primary"
          :class="{
            'input-error': mutationPost.isErr,
          }"
          placeholder="What todo?"
        />

        <button
          @click="mutationPost.mutate({ text: text })"
          class="btn btn-primary w-32"
          :class="{ loading: mutationPost.isLoading }"
        >
          Submit
        </button>
      </div>

      <p class="py-2 text-sm text-red-500">
        {{ mutationPost.mapErr("", (error) => error) }}
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
          v-bind:key="sortItem[0]"
          :class="{ 'btn-active': sortItem[0] === sort }"
          class="btn btn-sm"
        >
          {{ sortItem[1] }}
        </button>
      </div>
    </div>

    <div class="flex flex-col items-center justify-center flex-1 w-full pb-16">
      <div class="px-4 w-full">
        <div v-if="query.isError" class="alert alert-error shadow-lg">
          {{ query.isError ? query.error : "" }}
        </div>
      </div>

      <p
        v-if="query.isOk"
        class="opacity-75 h-64 text-xl font-bold flex items-center justify-center"
      >
        {{
          items.length === 0
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
          v-for="item in items"
          v-bind:key="item.id"
          class="inner w-full flex items-center pr-6"
        >
          <div
            class="flex-1 flex items-center p-4 pl-6"
            :class="{
              'cursor-wait': mutationPatch.isLoading,
              'cursor-pointer active:bg-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700':
                !mutationPatch.isLoading,
              'opacity-50': mutationPatch.mapParams(
                false,
                (params) => params.params.itemId === item.id
              ),
            }"
            @click="
              mutationPatch.mutate({
                params: { itemId: item.id },
                body: { isCompleted: !item.isCompleted },
              })
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
                {{ item.createdAtFormatted }}
              </p>
            </div>
          </div>
          <button
            class="btn btn-outline btn-error btn-xs"
            :class="{
              'loading cursor-wait':
                mutationDelete.isErr &&
                mutationDelete.mapParams(
                  false,
                  (params) => params.id === item.id
                ),
            }"
            @click="mutationDelete.mutate({ id: item.id })"
          >
            Delete
          </button>
        </li>
      </ol>

      <Spinner class="p-4" v-if="query.isLoading" />
    </div>
  </div>
</template>
