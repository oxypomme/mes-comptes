import { region } from '../../firebase'
import onOperationWrite from '../../actions/updateBalances'

const doc = region.firestore.document(
  'users/{userId}/accounts/{accountId}/operations/{operationId}'
)

/**
 * Trigger on new operation
 */
export const onWrite = doc.onWrite(onOperationWrite)
