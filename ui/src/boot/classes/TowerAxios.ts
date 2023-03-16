import {AxiosError, AxiosInstance, AxiosRequestConfig} from 'axios';
import {Store} from 'pinia';
import {Router} from 'vue-router';

export class TowerAxios {
	axios: AxiosInstance;
	store?: Store<
		'tower_user',
		{ roles: Array<string>; name: string; tokenId: string },
		{
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			getUsername: (state) => state.name;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			getTokenId: (state) => state.tokenId;
		},
		{
			setUserDetails(tokenId: string, name: string, roles: string[]): void;
			reset(): void;
		}
	>;

	router: Router;

	constructor(axiosInstance: AxiosInstance, userSt: any, router: Router) {
		this.axios = axiosInstance;
		this.store = userSt;
		this.router = router;

		this.addInterceptors();
	}

	setHeaders(config?: AxiosRequestConfig) {
		if (this.store && this.store.getTokenId) {
			if (config) {
				if (!config.headers) {
					config.headers = {};
				}
				if (!config.headers['Authorization']) {
					config.headers['Authorization'] = this.store.getTokenId();
				}
			} else {
				config = {
					headers: {
						Authorization: this.store.getTokenId
					}
				};
			}
		}

		return config;
	}

	addInterceptors() {
		//onError
		this.axios.interceptors.response.use(undefined, async error => {
			await this.onError(error);
		});
	}

	async onError(error: AxiosError) {
		if (error.response?.status === 401) {
			await this.router.push('/login');
		}

		return Promise.reject(error);
	}

	async get(url: string, config?: AxiosRequestConfig) {
		config = this.setHeaders(config);

		return await this.axios.get(url, config);
	}

	async post(url: string, data?: unknown, config?: AxiosRequestConfig) {
		config = this.setHeaders(config);

		return this.axios.post(url, data, config);
	}

	async put(url: string, data?: unknown, config?: AxiosRequestConfig) {
		config = this.setHeaders(config);

		return this.axios.put(url, data, config);
	}

	async patch(url: string, data?: unknown, config?: AxiosRequestConfig) {
		config = this.setHeaders(config);

		return await this.axios.patch(url, data, config);
	}

	async delete(url: string, config?: AxiosRequestConfig) {
		config = this.setHeaders(config);

		return await this.axios.delete(url, config);
	}
}
