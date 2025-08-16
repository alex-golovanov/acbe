import store from 'store';

import { ANTIVIRUS } from 'constants/common';
import { POPUP_PROXY_BLOCKED_BY_ANTIVIRUS } from 'popup/components/constants';
import { showModal } from '../modal/showModal';

/**
 * Checks if the antivirus modal should be shown and shows it if necessary.
 */
export const checkShowingAntivirusModal = async () => {
  const show = (warnings: string[]) => {
    if (warnings.includes(ANTIVIRUS))
      showModal(POPUP_PROXY_BLOCKED_BY_ANTIVIRUS);
  };

  const { warnings } = await store.getStateAsync();
  show(warnings);

  store.onChange(
    ({ warnings }) => warnings,
    (warnings) => show(warnings),
  );
};
