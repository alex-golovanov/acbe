/**
 * Function to hide a modal element.
 *
 * @param {string} litElementName - The name of the lit element to hide.
 */
export const hideModal = (litElementName: string) => {
  const parent: HTMLElement | null =
    document.querySelector('div.MainContainer');
  if (!parent || !litElementName) return;

  const modal: HTMLElement | null = parent.querySelector(litElementName);
  if (modal) {
    parent.removeChild(modal);
  }
};
