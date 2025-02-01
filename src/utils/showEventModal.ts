export default function showEventModal(
  dialogId: string,
  openDialogButtonId: string
) {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement
  const openDialogButton = document.getElementById(
    openDialogButtonId
  ) as HTMLButtonElement

  if (dialog && openDialogButton) {
    openDialogButton.addEventListener('click', () => {
      dialog.showModal()
    })
  }
}
