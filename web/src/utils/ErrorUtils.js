class ErrorUtils {

    static handleError(error, router) {
        if (401 === error?.response?.status) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
        } else if (403 === error?.response?.status) {
            router.push('/');
            return;
        }

        console.error('An error occurred:', error);
    }

    static asMessage(error, router) {
        if (router) {
            this.handleError(error, router);
        }

        if (error?.response?.data?.message) {
            return error.response.data.message;
        } else if (error?.response?.data) {
            return error.response.data;
        } else if (error?.message) {
            return error.message;
        } else {
            return 'An unknown error occurred.';
        }
    }
}

export default ErrorUtils;