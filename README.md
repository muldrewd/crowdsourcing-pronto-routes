# Crowdsourcing Pronto Interstation Routes

What do new bikers in the Seattle area want to know?

1.	what routes are safest and what the hazards/areas to avoid are
2.	the difficulty of routes (hills, etc.) and what the scenery will be like
3.	how to get to nearby interesting places, bike tour options

Use Pronto bike sharing as a starting point. Why?

1.	good source of new Seattle bikers who would like to know good routes to the bike stations near their destination
2.	helps makes new users aware of of planned bike corridors that are safer
3.	tractable problem since there are a finite number of stations (50 stations so far - more in the future), which would be much easier to crowdsource new routes among the stations and match the previous route data to a new commuting trip request
4.	can later be extended to be a useful platform for people who own their own bikes as well or other bike sharing programs

Plan for the project:

1.	use the Google Maps api to represent the routes - would be nice to include a way to manually adjust routes with waypoints in mobile app
2.	ability to enter in a desired address and identify a nearby Pronto station to leave the bike 
3.	tap into the Pronto API to check bike station status (available bike, docking space)
4.	analyze the existing Pronto bike sharing data and determine the trips that are most in demand - input in some sample routes for frequent trips so people have something to start out with
5.	beyond trip distance and time estimates, have a way rate routes according to safety (separation from cars, etc), difficulty, scenery, trip cost, car traffic - particularly during rush hour
6.	user comment system for overall route and waypoints, a tagging system for the routes to search over
7.	bike tour routes category with comments along the route
8.	“Trailblazer” trip recording feature to automatically input in a trip of a user that wants to try something different and give users a record of what they’ve biked already. This would probably be easier to do by hooking into an existing service like: https://ridewithgps.com/api

## Team Members

Our team is comprised of:

- Daniel Muldrew [@muldrewd](https://github.com/muldrewd/) 

## Technologies, APIs, and Datasets Utilized

We made use of:

- jQuery
- Google Maps API
- Google Mapmaker (https://www.google.com/mapmaker?gw=66&ptab=1&uid=217151611049476866638&start=0&sort=)
- User Generated Route Database [API](https://communities.socrata.com/Community-Resources/Pronto-Bike-Routes/4uqz-b36x)
- Pronto Bike Stations [API](https://communities.socrata.com/Community-Resources/Pronto-Bike-Share-Stations/rsib-fvg5)

Our code is licensed under the [MIT License](LICENSE.md). Pull requests will be accepted to this repo, pending review and approval.
