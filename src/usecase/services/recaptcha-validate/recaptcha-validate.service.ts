import { Injectable } from '@nestjs/common';
import axios from "axios"; // Use axios
import { GenericResponse } from 'src/domain/dto/generic';

@Injectable()
export class RecaptchaValidateService {

    /**
     * Validates a reCAPTCHA token with Google's reCAPTCHA API.
     * @param {string} token - The reCAPTCHA token received from the client.
     * @returns {Promise<{success: boolean;score?: number;action?: string;errorCodes?: string[];}>}
     */
    async validateRecaptchaToken(token: string): Promise<GenericResponse<boolean>> {
        console.log(process.env.SECRET_KEY)
        try {
            const response = await axios.post(
                process.env.CAPTCHA_VALIDATE_API,
                {
                    secret: process.env.SECRET_KEY,
                    response: token,
                },
            );

            if (response.status === 200) {
                const data = response.data;

                if (data.success) {
                    return {
                        success: true,
                        message: null,
                        data: null

                    };
                } else {
                    return {
                        success: false,
                        message: data['error-codes'][0],
                        data: null
                    };
                }
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error validating reCAPTCHA token:', error.message);

            // Handle specific error cases
            if (error.response) {
                // The server responded with a status other than 2xx
                return {
                    success: false,
                    message: `Server responded with status ${error.response.status}`,
                    data: null
                };
            } else if (error.request) {
                // No response was received
                return {
                    success: false,
                    message: 'No response from reCAPTCHA server. Please try again later.',
                    data: null
                };
            } else {
                // Something else went wrong
                return {
                    success: false,
                    message: error.message,
                    data: null
                };
            }
        }
    }

}
