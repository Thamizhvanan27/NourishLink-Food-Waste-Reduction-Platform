package com.foodwaste.location;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GeoUtilsTest {

    @Test
    void testCalculateDistanceSamePoint() {
        double dist = GeoUtils.haversine(13.0827, 80.2707, 13.0827, 80.2707);
        assertEquals(0.0, dist, 0.01, "Distance between the same coordinates should be zero");
    }

    @Test
    void testCalculateDistanceKnownLocations() {
        // Chennai (13.0827, 80.2707) to Bangalore (12.9716, 77.5946) ~ 290 KM
        double dist = GeoUtils.haversine(13.0827, 80.2707, 12.9716, 77.5946);
        assertTrue(dist > 280.0 && dist < 310.0, "Expected distance between Chennai and Bangalore around ~290 KM, got: " + dist);
    }

    @Test
    void testIsWithinRadius() {
        // Chennai center, 5 km away point
        double lat1 = 13.0827;
        double lon1 = 80.2707;
        // ~2.2 km away
        double lat2 = 13.0900;
        double lon2 = 80.2850;

        assertTrue(GeoUtils.isWithinRadius(lat1, lon1, lat2, lon2, 10.0));
        assertFalse(GeoUtils.isWithinRadius(lat1, lon1, 12.9716, 77.5946, 50.0));
    }
}
