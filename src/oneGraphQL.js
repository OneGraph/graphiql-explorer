function defaultQuery(showBeta) {
  return showBeta
    ? `{
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
}`
    : `{
  me {
    oneGraph {
      fullName
      email
    }
    stripe {
      displayName
      businessUrl
      email
    }
  }
}`;
}

export {defaultQuery};
