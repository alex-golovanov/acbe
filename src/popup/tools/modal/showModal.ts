/**
 * Function to show a modal with a specified LitElement.
 *
 * @param {string} litElementName - The name of the LitElement to be appended
 */
export const showModal = (litElementName: string) => {
  const parent: HTMLElement | null =
    document.querySelector('div.MainContainer');
  if (!parent || !litElementName) return;

  // Check if a modal is already present
  const existingModal = parent.querySelector(litElementName);
  if (existingModal) return;

  parent.append(document.createElement(litElementName));
};
