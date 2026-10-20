
# Location privacy and implementation boundary
GPS sharing must be foreground-only unless a dedicated mobile implementation supports background location with appropriate permissions. Obtain clear customer consent, let users revoke it, scope location access to assigned active deliveries, stop updates at completion/cancellation, throttle updates, validate coordinates/timestamps, and avoid logging coordinates. The starter includes schemas but does not claim the full tracking workflow is production-complete.
