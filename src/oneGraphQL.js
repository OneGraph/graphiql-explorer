const defaultQuery = `{
  me {
    github {
      avatarUrl
      login
      email
    }
    oneGraph {
      fullName
      email
    }
    stripe {
      displayName
      businessUrl
      email
    }
    twitter {
      screenName
      name
    }
  }
}`;

export {defaultQuery};
