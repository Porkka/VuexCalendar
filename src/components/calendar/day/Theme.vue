<template>
<td 
    draggable="true"
    @drop="onDrop"
    @dragstart="onDragstart"
    @dragover.prevent="onDragover"
    @click.stop.prevent="onClick"
    v-bind:class="day.classes"
    v-bind:data-sanitized="day.sanitized"
    v-bind:data-timestamp="day.timestamp">
    {{ _isMonth() ? day.text : '' }}
    <entry v-for="(entry, k) in day_entries" 
    v-bind:key="k" 
    v-on:draggedOver="onDraggedOverEntry"
    v-bind:entry="entry"></entry>
</td>
</template>