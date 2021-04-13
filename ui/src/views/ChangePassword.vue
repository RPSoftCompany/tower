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
          <v-img
            :width="384"
            src="@/assets/tower.png"
            class="towerImage"
          />
          <v-card-text>
            <v-form
              ref="form"
              v-model="form.valid"
            >
              <v-text-field
                v-model="password.newPass"
                :rules="[rules.exists]"
                label="New password"
                type="password"
                @keyup.enter="submit"
              />
              <v-text-field
                v-model="password.newPassAgain"
                :rules="[rules.exists, rules.sameAsPrev]"
                label="Repeat new password"
                type="password"
                @blur="validate"
                @keyup.enter="submit"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              :disabled="!form.valid"
              color="primary"
              block
              @click="submit"
            >
              Change Password
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'ChangePassword',
    data: props => ({
      form: {
        valid: false,
      },
      password: {
        old: null,
        newPass: null,
        newPassAgain: null,
      },
      rules: {
        exists: v => !!v || 'Required',
        sameAsPrev: v =>
          v === props.password.newPass || 'Passwords does not match',
      },
    }),
    methods: {
      validate () {
        return this.$refs.form.validate()
      },
      async submit () {
        if (!this.validate()) {
          return
        }

        await this.axios.post(
          `${this.$store.state.mainUrl}/members/changeUserPassword`,
          { newPassword: this.password.newPass },
        )

        this.$router.push('/login')
      },
    },
  }
</script>
