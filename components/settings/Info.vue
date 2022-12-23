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
          <div v-for="{ name, link, status } in apis" :key="name">
            <b>
              API <a :href="link">{{ name }}</a> :
            </b>
            <v-chip :color="status.color" x-small>
              {{ status.value }}
            </v-chip>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { checkAPIstatus as checkCurrencyAPIStatus } from '~/ts/currency'
import { calcNextPeriod, Period } from '~/functions/src/utils/period'
import dayjs from '~/ts/dayjs'
import type { SettingsState } from '~/ts/types'

type API = {
  name: string
  link: string
  handler: () => Promise<boolean>
  status: {
    value: string
    color: string
  }
}

export default Vue.extend({
  data() {
    return {
      apis: [
        {
          name: 'exchangerate',
          link: 'https://exchangerate.host',
          handler: checkCurrencyAPIStatus,
          status: {
            value: '...',
            color: 'orange',
          },
        },
      ] as API[],
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
    this.apis.map(this.pingHandler)
  },
  methods: {
    async pingHandler(api: API) {
      try {
        const res = await api.handler()
        api.status = {
          value: res ? 'OK' : 'KO',
          color: res ? 'green' : 'red',
        }
      } catch (error) {
        api.status = {
          value: 'KO',
          color: 'red',
        }
      }
    },
  },
})
</script>
