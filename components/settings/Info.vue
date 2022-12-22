<template>
  <div>
    <v-card-title class="font-weight-light">
      Informations générales
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col>
          <div>
            <b>Prochain reset :</b>
            Le {{ nextPeriod.start.format('DD/MM/YYYY') }} à
            {{ nextUserCheck.format('HH:MM') }}
          </div>
          <div>
            <b>Prochaine période :</b>
            {{
              `Du ${nextPeriod.start.format(
                'DD/MM/YYYY'
              )} au ${nextPeriod.end.format('DD/MM/YYYY')} (${
                nextPeriod.duration
              } jours)`
            }}
          </div>
          <v-divider class="my-2"></v-divider>
          <div>
            <b>API <i>devises</i> :</b>
            <v-chip :color="currencyStatus.color" x-small>
              {{ currencyStatus.value }}
            </v-chip>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { checkAPIstatus } from '~/ts/currency'
import { calcNextPeriod, Period } from '~/functions/src/utils/period'
import dayjs from '~/ts/dayjs'
import type { SettingsState } from '~/ts/types'

export default Vue.extend({
  data() {
    return {
      currencyStatus: {
        value: '...',
        color: 'orange',
      },
    }
  },
  computed: {
    nextUserCheck(): dayjs.Dayjs {
      // ! Keep in sync with firecloud !
      const now = dayjs()
      const check = now
        .tz('America/Los_Angeles')
        .set('hours', 23)
        .set('minutes', 0)
        .set('second', 0)

      return check.tz(dayjs.tz.guess())
    },
    period(): Period {
      const settings: SettingsState = this.$store.getters.getSettings
      return {
        start: dayjs(settings.activePeriod.start.toDate()),
        end: dayjs(settings.activePeriod.end.toDate()),
      }
    },
    nextPeriod(): Period & { duration: number } {
      return calcNextPeriod(this.period)
    },
  },
  mounted() {
    checkAPIstatus()
      .then(
        (res) =>
          (this.currencyStatus = {
            value: res ? 'OK' : 'KO',
            color: res ? 'green' : 'red',
          })
      )
      .catch(
        () =>
          (this.currencyStatus = {
            value: 'KO',
            color: 'red',
          })
      )
  },
})
</script>
