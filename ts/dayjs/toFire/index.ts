import type { PluginFunc } from 'dayjs'
import firebase from 'firebase/app'
import 'firebase/firestore'

declare module 'dayjs' {
  interface Dayjs {
    toFire(): firebase.firestore.Timestamp
  }
}

const plugin: PluginFunc = (_option, dayjsClass, _dayjsFactory) => {
  dayjsClass.prototype.toFire = function () {
    // eslint-disable-next-line import/no-named-as-default-member
    return firebase.firestore.Timestamp.fromMillis(this.valueOf())
  }
}

export default plugin
