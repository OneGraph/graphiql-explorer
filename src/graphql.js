const defaultQuery = `{
  me {
    stripe {
      displayName
      businessUrl
      email
    }
    twitter {
      screenName
      name
    }
    oneGraph {
      fullName
      email
    }
    google {
      familyName
      givenName
      email
    }
    github {
      avatarUrl
      login
      email
    }
  }
}`;

export {defaultQuery};
