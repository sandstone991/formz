<script setup lang="ts">
import Button from '~/components/ui/button/Button.vue';
import { useInjectNodeProps } from '../../composables';
import { PopoverContent, Popover, PopoverTrigger } from '~/components/ui/popover';
import { isInputNode } from './utils';
import { CardContent, CardTitle, CardHeader, Card } from '~/components/ui/card';
import { Separator } from '@/components/ui/separator'
import { blocksRegistry, type BlockTypes } from '../../nodes';

defineProps<{ isHovered: boolean }>();
const nodeProps = useInjectNodeProps();
const insertNodeAfter = () => {
    nodeProps.editor.commands.insertContentAt(nodeProps.getPos() + nodeProps.node.nodeSize, {
        type: "paragraph",
    })
}
const handleItemClassName = "w-2 h-2 p-2 hover:bg-gray-400"
const popoverItemClassName = "flex justify-start items-center gap-2 p-1 w-full border-0"
const isPopoverOpen = ref(false);
const isEditing = ref(false);
const inputValue = ref(nodeProps.node.attrs.labelText);
const inputRef = ref<HTMLInputElement | null>(null);
const handleBlur = () => {
    isEditing.value = false;
    inputValue.value = nodeProps.node.attrs.labelText;
}
const save = () => {
    isEditing.value = false;
    nodeProps.updateAttributes({
        ...nodeProps.node.attrs,
        labelText: inputValue.value,
        labelTextExplicitlySet: true
    })
}
const handleStartEditing = () => {
    isEditing.value = true;
    nextTick(() => {
        inputRef.value?.focus();
    })
}
</script>
<template>
    <div contenteditable="false"
        class="absolute z-10 bg-white overflow-visible inline-start-[-30px] sm:inline-start-[-80px] shadow-md rounded-md p-2 -top-1 flex flex-row gap-2 justify-between items-center bg-transparent"
        :class="{
            'hidden': !isHovered && !isPopoverOpen,
        }">

        <Button as="span" variant="default" :class="handleItemClassName" class="icon-[ph--trash-thin] hidden sm:block"
            @click="nodeProps.deleteNode"></Button>
        <Button as="span" variant="default" :class="handleItemClassName"
            class="icon-[ic--baseline-plus] hidden sm:block" @click="insertNodeAfter"></Button>
        <Popover :modal="true" :open="isPopoverOpen" @update:open="(e) => {
            isPopoverOpen = e
        }
            ">
            <PopoverTrigger data-drag-handle="true">
                <Button as="span" variant="default" :class="handleItemClassName"
                    class="icon-[grommet-icons--drag]"></Button>
            </PopoverTrigger>
            <PopoverContent side="left" class="w-72" :as-child="true">
                <Card class="p-0">
                    <CardHeader v-if="isInputNode(nodeProps.node)" class="p-2 px-3">
                        <div class="flex justify-between items-center">
                            <div class="flex gap-2 text-sm font-bold items-center justify-center">
                                <span :class="[blocksRegistry[nodeProps.node.type.name as BlockTypes].icon]"
                                    class="text-gray-600"></span>
                                <span v-if="!isEditing">{{ nodeProps.node.attrs.labelText }}</span>
                                <input ref="inputRef" v-model="inputValue" @onblur="handleBlur" v-else class="border-0 outline-none" />
                            </div>
                            <Button variant="ghost" @click="handleStartEditing" v-if="!isEditing">
                                <span class="icon-[lucide--pen-line] text-gray-600"></span>
                            </Button>
                            <Button variant="ghost" @click="save" v-else>
                                Save
                            </Button>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent class="p-2 px-3">
                        <Button variant="outline" :class="popoverItemClassName">
                            <span class="icon-[ph--trash]"></span>
                            <span>
                                Delete
                            </span>
                        </Button>
                        <Button variant="outline" :class="popoverItemClassName">
                            <span class="icon-[ic--outline-control-point-duplicate]"></span>
                            <span>
                                Duplicate
                            </span>
                        </Button>
                        <Button v-if="!nodeProps.node.attrs.hidden" variant="outline" :class="popoverItemClassName"
                            @click="
                                nodeProps.updateAttributes({
                                    ...nodeProps.node.attrs,
                                    hidden: true
                                })
                                ">
                            <span class="icon-[mdi--hide]"></span>
                            <span>
                                Hide
                            </span>
                        </Button>
                        <Button v-else variant="outline" :class="popoverItemClassName" @click="
                            nodeProps.updateAttributes({
                                ...nodeProps.node.attrs,
                                hidden: false
                            })
                            ">
                            <span class="icon-[mdi--eye]"></span>
                            <span>
                                Show
                            </span>
                        </Button>
                        <Button v-if="isInputNode(nodeProps.node)" variant="outline" :class="popoverItemClassName">
                            <span class="icon-[lucide--git-pull-request]"></span> <span>
                                Add conditional logic
                            </span>
                        </Button>

                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>

    </div>

</template>

<style scoped></style>