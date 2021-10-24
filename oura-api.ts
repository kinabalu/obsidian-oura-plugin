import {request} from "obsidian";
import {OuraActivityEntries, OuraReadinessEntries, OuraSleepEntries, OuraUserInfo} from "./types";

const OURA_API_URL = 'https://api.ouraring.com/v1'

export default class OuraApi {
    token!: string

    constructor(token: string) {
        this.token = token
    }

    async getSleepData(theDate: string): Promise<OuraSleepEntries> {
        if (this.token) {
            const params = new URLSearchParams()
            const start = window.moment(theDate).subtract(1, 'days').format('YYYY-MM-DD')
            params.set('start', start)
            params.set('end', theDate)
            const data = await request({
                url: `${OURA_API_URL}/sleep?${params.toString()}`, headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            })

            return JSON.parse(data) as OuraSleepEntries
        }
        return null
    }

    async getActivityData(theDate: string): Promise<OuraActivityEntries> {
        if (this.token) {
            const params = new URLSearchParams()
            const start = window.moment(theDate).subtract(1, 'days').format('YYYY-MM-DD')
            params.set('start', start)
            params.set('end', theDate)
            const data = await request({
                url: `${OURA_API_URL}/activity?${params.toString()}`, headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            })

            return JSON.parse(data) as OuraActivityEntries
        }
        return null
    }

    async getReadinessData(theDate: string): Promise<OuraReadinessEntries> {
        if (this.token) {
            const params = new URLSearchParams()
            const start = window.moment(theDate).subtract(1, 'days').format('YYYY-MM-DD')
            params.set('start', start)
            params.set('end', theDate)
            const data = await request({
                url: `${OURA_API_URL}/readiness?${params.toString()}`, headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            })

            return JSON.parse(data) as OuraReadinessEntries
        }
        return null
    }

    async getUserInfo(): Promise<OuraUserInfo> {
        if (this.token) {
            const data = await request({
                url: `${OURA_API_URL}/userinfo`, headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            })
            return JSON.parse(data) as OuraUserInfo
        }
        return null
    }
}