import { For, createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
// import { Select } from '@/components/ui/base/Select'
import {
  addConversation,
  currentEditingConversation,
  updateConversationById,
} from '@/stores/conversation'
import { showConversationEditModal } from '@/stores/ui'
import { providerMetaList } from '@/stores/provider'
import type { ConversationType } from '@/types/conversation'

const typeSelectList = [
  {
    value: 'single' as const,
    label: 'Single Conversation',
    icon: 'i-carbon-connect',
  },
  {
    value: 'continuous' as const,
    label: 'Continuous Conversation',
    icon: 'i-carbon-edt-loop',
  },
  {
    value: 'image' as const,
    label: 'Image Generation',
    icon: 'i-carbon-image',
  },
]
const iconList = [
  'i-carbon-chat',
  'i-carbon-basketball',
  'i-carbon-game-console',
  'i-carbon-palm-tree',
]

export default () => {
  let inputRef: HTMLInputElement
  const $currentEditingConversation = useStore(currentEditingConversation)
  const $providerMetaList = useStore(providerMetaList)
  const [currentEditingId, setCurrentEditingId] = createSignal('')
  const [selectConversationType, setSelectConversationType] = createSignal<ConversationType>('single')
  const [selectIcon, setSelectIcon] = createSignal('i-carbon-chat')
  const [selectProviderId, setSelectProviderId] = createSignal(providerMetaList.get()[0]?.id)
  const selectProvider = () => providerMetaList.get().find(item => item.id === selectProviderId()) || null

  const handleAdd = () => {
    const currentId = currentEditingId()
    const payload = {
      providerId: selectProviderId(),
      conversationType: selectConversationType(),
      name: inputRef.value || '',
      icon: selectIcon(),
    }
    if (currentId)
      updateConversationById(currentId, payload)
    else
      addConversation(payload)

    showConversationEditModal.set(false)
    inputRef.value = ''
  }

  showConversationEditModal.listen((showModal) => {
    if (showModal) {
      const current = currentEditingConversation.get()
      if (current?.id) {
        setCurrentEditingId(current.id)
        const { name, icon, conversationType } = current
        inputRef.value = name
        setSelectConversationType(conversationType)
        setSelectIcon(icon || 'i-carbon-chat')
      } else {
        setCurrentEditingId('')
        inputRef.value = ''
        setSelectConversationType('single')
        setSelectIcon('i-carbon-chat')
      }
    } else {
      setCurrentEditingId('')
    }
  })

  return (
    <div class="p-6">
      <header class="mb-4">
        <h1 class="font-bold">Edit Conversation</h1>
      </header>
      <main class="flex flex-col gap-4">
        <input
          ref={inputRef!}
          type="text"
          placeholder="Untitled"
          class="w-full bg-transparent border border-base px-4 py-3 input-base focus:border-darker"
        />
        {/* <Select
          options={$providerMetaList().map(item => ({ value: item.id, label: item.name }))}
          value={selectProviderId}
          setValue={setSelectProviderId}
        /> */}
        <div>
          <For each={typeSelectList.filter(item => selectProvider()?.supportConversationType.includes(item.value))}>
            {item => (
              <div
                class="flex items-center gap-3 p-4 border border-base"
                classList={{
                  'border-emerald-500 text-emerald': selectConversationType() === item.value,
                  'op-50': !!$currentEditingConversation(),
                  'hv-base': !$currentEditingConversation(),
                }}
                onClick={() => { !$currentEditingConversation() && setSelectConversationType(item.value) }}
              >
                <div class={`text-xl ${item.icon}`} />
                <div>{item.label}</div>
              </div>
            )}
          </For>
        </div>
        <div class="flex flex-wrap gap-2">
          <For each={iconList}>
            {item => (
              <div
                class="fcc w-12 h-12 border border-base hv-base"
                classList={{ 'border-emerald-500 text-emerald': selectIcon() === item }}
                onClick={() => { setSelectIcon(item) }}
              >
                <div class={`text-xl ${item}`} />
              </div>
            )}
          </For>
        </div>
      </main>
      <div class="fcc p-4 border border-base mt-8 hv-base" onClick={handleAdd}>OK</div>
    </div>
  )
}
