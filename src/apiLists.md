<!-- dev tinder APIs -->
<!-- auth Router -->

- POST /signup
  -POST /login
  -POST /logout

<!-- profile router -->

- GET /profile/view
  -PATCH /profile/edit
  -PATC /profile/password / -> forgot password

        <!-- connection request router -->

-POST /request/send/status/:id
-POST /request/review/status/:id

- GET /request/review/accepted/:requestedId
- GET / requests/revie/rejected/:requestId

<!-- User Router -->

-get user/connections
-GET/ requests
-GET user/feed - gets you the profiles of other users on platform
