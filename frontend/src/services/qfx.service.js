import apiService from './api.service';
import API_CONFIG from '../config/api';

class QfxService {
    async getNowShowingMovies() {
        return apiService.get(API_CONFIG.ENDPOINTS.QFX_MOVIES_NOW_SHOWING);
    }

    async getUpcomingMovies() {
        return apiService.get(API_CONFIG.ENDPOINTS.QFX_MOVIES_UPCOMING);
    }

    async getMovieDetails(id) {
        return apiService.get(`${API_CONFIG.ENDPOINTS.QFX_MOVIE_DETAILS}${id}`);
    }

    async getCinemas() {
        return apiService.get(API_CONFIG.ENDPOINTS.QFX_CINEMAS);
    }

    async getShowtimes(movieId, cinemaId, date) {
        const queryParams = new URLSearchParams({
            movieId,
            cinemaId,
            date
        }).toString();
        return apiService.get(`${API_CONFIG.ENDPOINTS.QFX_SHOWTIMES}?${queryParams}`);
    }

    async getSeatLayout(showtimeId) {
        return apiService.get(`${API_CONFIG.ENDPOINTS.QFX_SEATS}${showtimeId}`);
    }

    async bookTicket(bookingData) {
        return apiService.post(API_CONFIG.ENDPOINTS.QFX_BOOK_TICKET, bookingData);
    }

    async cancelBooking(cancellationData) {
        return apiService.post(API_CONFIG.ENDPOINTS.QFX_CANCEL_BOOKING, cancellationData);
    }

    async getBookingStatus(bookingId) {
        return apiService.get(`${API_CONFIG.ENDPOINTS.QFX_BOOKING_STATUS}${bookingId}`);
    }
}

export default new QfxService();
