//    Copyright RPSoft 2019,2020. All Rights Reserved.
//    This file is part of RPSoft Tower.
//
//    Tower is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 3 of the License, or
//    (at your option) any later version.
//
//    Tower is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Tower.  If not, see http://www.gnu.org/licenses/gpl-3.0.html.

<template>
  <v-container
    class="fill-height"
    fluid
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="4"
        style="max-width:389px;"
      >
        <v-card>
          <div class="px-4 pt-4">
            <img
              src="@/assets/tower.png"
              width="333"
              class="towerImage"
            >
          </div>
          <v-card-text>
            <v-form
              ref="form"
              v-model="form.valid"
            >
              <v-text-field
                v-model="encryption.key"
                label="Encryption key"
                counter
                maxlength="32"
                :rules="[rules.exists, rules.fullLength]"
                @keyup.enter="submit"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              block
              :disabled="!form.valid"
              :elevation="!form.valid ? 1 : undefined"
              @click="submit"
            >
              Set encryption key
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'Initialize',
    data: () => ({
      form: {
        valid: false
      },
      encryption: {
        key: ''
      },
      rules: {
        exists: v => !!v || 'Required',
        fullLength: v => v.length === 32 || 'Encryption key must be 32 characters long'
      }
    }),
    async beforeCreate () {
      const response = await this.axios.get(
        `${this.$store.state.mainUrl}/configurations/initialized`
      )

      if (response.status === 200) {
        this.$store.state.initialized = response.data
        if (this.$store.state.initialized === true) {
          await this.$router.push('/login')
        }
      }
    },
    methods: {
      validate () {
        return this.$refs.form.validate()
      },
      async submit () {
        if (!this.validate()) {
          return
        }

        await this.axios.post(
          `${this.$store.state.mainUrl}/configurations/initialize?secret=${this.encryption.key}`
        )

        await this.$router.push('/login')
      }
    }
  }
</script>
