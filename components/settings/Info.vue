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
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import dayjs from '~/ts/dayjs'
import type { Settings, SettingsState } from '~/ts/types'

export default Vue.extend({
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
    period(): Settings['activePeriod'] {
      const settings: SettingsState = this.$store.getters.getSettings
      return {
        start: dayjs(settings.activePeriod.start.toDate()),
        end: dayjs(settings.activePeriod.end.toDate()),
      }
    },
    nextPeriod(): Settings['activePeriod'] & { duration: number } {
      // ! Keep in sync with firecloud !
      const newStart = this.period.end.add(1, 'day')
      let duration = this.period.end.diff(this.period.start, 'days')
      if (
        this.period.start.month() !== this.period.end.month() &&
        duration === 29
      ) {
        duration += 1
      }
      return {
        start: newStart,
        end: newStart.add(duration, 'days'),
        duration,
      }
    },
  },
})
</script>
