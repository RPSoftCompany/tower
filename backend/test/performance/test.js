/*
 * Copyright RPSoft 2019,2023. All Rights Reserved.
 * This file is part of RPSoft Tower.
 *
 * Tower is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tower is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tower. If not, see http:www.gnu.org/licenses/gpl-3.0.html.
 */

import http from 'k6/http';

export const options = {
  discardResponseBodies: false,
  scenarios: {
    contacts: {
      executor: 'constant-vus',
      vus: 10,
      duration: '600s',
    },
  },
};

export const setup = () => {
  const url = 'http://localhost:5000';

  const temp = http.post(
    `${url}/members/login`,
    JSON.stringify({
      username: 'admin',
      password: 'admin',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  console.log(JSON.parse(temp.body).id);

  return { token: JSON.parse(temp.body).id };
};

export default (data) => {
  const Environments = [];
  const Apps = [];
  for (let i = 0; i < 100; i++) {
    Environments.push(`Environment_${i}`);
    Apps.push(`Apps_${i}`);
  }

  http.get('https://test.k6.io');

  const url = 'http://localhost:5000';

  const token = data.token;

  const variables = [];
  for (let i = 0; i < 200; i++) {
    variables.push({
      name: `variable${i}`,
      value: Math.random().toString(36).substring(2, 20),
      type: 'string',
    });
  }

  const randomApp = Apps[Math.floor(Math.random() * Environments.length)];
  const randomEnv = Environments[Math.floor(Math.random() * Apps.length)];

  // try {
  //   http.post(
  //     `${url}/configurationModels`,
  //     JSON.stringify({
  //       name: randomEnv,
  //       base: 'Environment',
  //       rules: [],
  //       restrictions: [],
  //       options: {
  //         hasRestrictions: false,
  //       },
  //     }),
  //     {
  //       headers: { Authorization: token, 'Content-Type': 'application/json' },
  //     },
  //   );
  // } catch (e) {
  //   // IGNORE
  // }
  //
  // try {
  //   http.post(
  //     `${url}/configurationModels`,
  //     JSON.stringify({
  //       name: randomApp,
  //       base: 'Application',
  //       rules: [],
  //       restrictions: [],
  //       options: {
  //         hasRestrictions: false,
  //       },
  //     }),
  //     {
  //       headers: { Authorization: token, 'Content-Type': 'application/json' },
  //     },
  //   );
  // } catch (e) {
  //   // IGNORE
  // }

  http.post(
    `${url}/configurations`,
    JSON.stringify({
      Project: 'test',
      Environment: randomEnv,
      Application: randomApp,
      variables: variables,
    }),
    {
      headers: { Authorization: token, 'Content-Type': 'application/json' },
    },
  );
};
