## Assignment: Graphql
### Tasks:
1. Add logic to the restful endpoints (users, posts, profiles, member-types folders in ./src/routes).  
   1.1. npm run test - 100%  

 
 
  
   subscribeTo (create 2 users, 1 user id - path: localhost:3000/users/FIRST_USER_ID/subscribeTo)
   ```
    {
   "firstName": "olya",
   "lastName": "olya",
   "email": "olya@gmail.com",
    "userId": ["SECOND_USER_ID"]
   }
   ```

2. Add logic to the graphql endpoint (graphql folder in ./src/routes).  
Constraints and logic for gql queries should be done based on restful implementation.  
For each subtask provide an example of POST body in the PR.  
All dynamic values should be sent via "variables" field.  
If the properties of the entity are not specified, then return the id of it.  
`userSubscribedTo` - these are users that the current user is following.  
`subscribedToUser` - these are users who are following the current user.  
   
   * Get gql requests:  
   2.1. Get users, profiles, posts, memberTypes - 4 operations in one query.  
   ```
   {
    users {
      id
      firstName
      lastName
      email
    }
    profiles {
      id
      avatar
      sex
      birthday
      country
      street
      city
      userId
      memberTypeId
    }
    posts {
      id
      title
      content
      userId
    }
    memberTypes {
      id
      discount
      monthPostsLimit
    }
   }
   ```

   2.2. Get user, profile, post, memberType by id - 4 operations in one query. 
   ```
   {
   user(id: "COPY FROM CREATED USER") {
      id
      firstName
      lastName
      email
   }

   profile(id:  "COPY FROM CREATED PROFILE") {
      id
      avatar
      sex
      birthday
      country
      street
      city
      userId
      memberTypeId
   }

   post(id:  "COPY FROM CREATED POST") {
      id
      title
      content
      userId
   }

   memberType(id: "basic") {
      id
      discount
      monthPostsLimit
   }
   }
   ```

   2.3. Get users with their posts, profiles, memberTypes.  
   ```
      {
      users {
         id
         firstName
         lastName
         posts {
            id
            title
            content
         }
         memberType{
            id
         }
         profile{
            id
            avatar
            sex
            birthday
            country
            street
            city
            userId
            memberTypeId
         }
      }
   }
   ```
   2.4. Get user by id with his posts, profile, memberType.  
   ```
   {
      user(id: "COPY FROM CREATED USER") {        
         firstName
         lastName
         posts {
            id
            title
            content
         }
         memberType{
            id
         }
         profile{
            id
            avatar
            sex
            birthday
            country
            street
            city
            userId
            memberTypeId
         }
      }
   }
   ```
   
   2.5. Get users with their `userSubscribedTo`, profile.  7e571d44-c41d-407d-b4c7-afc7c56eef0e
   ```
   {
   users {
      id
      firstName
      lastName
      email
      subscribedToUserIds
      userSubscribedTo {
            id
            firstName
            lastName
            email
            subscribedToUserIds
      }
      profile {
            id
            avatar
            birthday
            city
            country
            memberType{
               id
               discount
               monthPostsLimit
            }
            street
            userId
         }
      }
   }
   ```

   2.6. Get user by id with his `subscribedToUser`, posts.  
   2.7. Get users with their `userSubscribedTo`, `subscribedToUser` (additionally for each user in `userSubscribedTo`, `subscribedToUser` add their `userSubscribedTo`, `subscribedToUser`).  
   * Create gql requests:   
   2.8. Create user.  
   ```
   mutation CreateUser($user: CreateUserType!) {
      createUser(user: $user) {
         id,
         firstName,
         lastName,
         email,
         subscribedToUserIds
      }
   }
   ```
    create new user VARIABLES
   ```
   {
    "user": {
        "firstName": "ira",
         "lastName": "ira",
         "email": "ira@gmail.com"
      }
   }  
   ```

   2.9. Create profile.  
   ```
   mutation createProfile($profile: CreateProfileType!){
    createProfile(profile: $profile)
    {
        id
        avatar
        sex
        birthday
        country
        street
        city
        memberTypeId
        userId
    }
   }
   ```
   create new profle VARIABLES
   ```
   {
    "profile": {
      "avatar": "IronMan",
      "sex": "men",
      "birthday": 45,
      "country": "USA",
      "street": "5 Avenue",
      "city": "NY",
      "userId": "COPY FROM CREATED USER",   
      "memberTypeId": "basic"
      }
   }
   ```

   2.10. Create post.  
   ```
   mutation createPost($post: CreatePostType!){
    createPost(post: $post)
    {
        id
        title
        content
        userId
    }
   }
   ```
  create new post VARIABLES
   ```
   {
	"post": {
               "title": "ira",
               "content": "post",
               "userId": "COPY FROM CREATED USER"
	   }
   }
   ```

   2.11. [InputObjectType](https://graphql.org/graphql-js/type/#graphqlinputobjecttype) for DTOs.  


   * Update gql requests:  
   2.12. Update user.
   ```
   mutation updateUser($user: UpdateUserType!){
    updateUser(user: $user)
    {
        id
        firstName
        lastName
        email
        subscribedToUserIds 
    }
   }
   ```
   update user VARIABLES
   ```
   {
	   "user": {
         "id": "COPY FROM CREATED USER",
         "firstName": "ira new",
         "lastName": "ira new",
         "email": "ira@gmail.com"
	   }
   }
   ```

   2.13. Update profile.  
   ```
   mutation updateProfile($profile: UpdateProfileType!){
    updateProfile(profile: $profile)
    {
        id
        avatar
        sex
        birthday
        country
        street
        city
        memberTypeId
        userId
    }
   }
   ```
   update profile VARIABLES
   ```
   {
	"profile": {
              "id": "COPY FROM CREATED PROFILE",
              "avatar": "Spider Man",
              "sex": "men",
              "birthday": 27,
              "country": "USA",
              "street": "Richmond",
              "city": "Los Angeles",
              "memberTypeId": "business",
              "userId": "COPY FROM CREATED USER"
	   }
   }
   ```

   2.14. Update post.  
   ```
   mutation updatePost($post: UpdatePostType!){
    updatePost(post: $post)
    {
        id
        title
        content
    }
   }
   ```
   update post VARIABLES
   ```
   {
	"post": {
              "id": "COPY FROM CREATED POST",
              "title": "Changed title",
              "content": "Cahnged content."
	   }
   }
   ```

   2.15. Update memberType.  
   2.16. Subscribe to; unsubscribe from.  
   2.17. [InputObjectType](https://graphql.org/graphql-js/type/#graphqlinputobjecttype) for DTOs.  

3. Solve `n+1` graphql problem with [dataloader](https://www.npmjs.com/package/dataloader) package in all places where it should be used.  
   You can use only one "findMany" call per loader to consider this task completed.  
   It's ok to leave the use of the dataloader even if only one entity was requested. But additionally (no extra score) you can optimize the behavior for such cases => +1 db call is allowed per loader.  
   3.1. List where the dataloader was used with links to the lines of code (creation in gql context and call in resolver).  
4. Limit the complexity of the graphql queries by their depth with [graphql-depth-limit](https://www.npmjs.com/package/graphql-depth-limit) package.   
   4.1. Provide a link to the line of code where it was used.  
   4.2. Specify a POST body of gql query that ends with an error due to the operation of the rule. Request result should be with `errors` field (and with or without `data:null`) describing the error.  

### Description:  
All dependencies to complete this task are already installed.  
You are free to install new dependencies as long as you use them.  
App template was made with fastify, but you don't need to know much about fastify to get the tasks done.  
All templates for restful endpoints are placed, just fill in the logic for each of them.  
Use the "db" property of the "fastify" object as a database access methods ("db" is an instance of the DB class => ./src/utils/DB/DB.ts).  
Body, params have fixed structure for each restful endpoint due to jsonSchema (schema.ts files near index.ts).  

### Description for the 1 task:
If the requested entity is missing - send 404 http code.  
If operation cannot be performed because of the client input - send 400 http code.  
You can use methods of "reply" to set http code or throw an [http error](https://github.com/fastify/fastify-sensible#fastifyhttperrors).  
If operation is successfully completed, then return an entity or array of entities from http handler (fastify will stringify object/array and will send it).  

Relation fields are only stored in dependent/child entities. E.g. profile stores "userId" field.  
You are also responsible for verifying that the relations are real. E.g. "userId" belongs to the real user.  
So when you delete dependent entity, you automatically delete relations with its parents.  
But when you delete parent entity, you need to delete relations from child entities yourself to keep the data relevant.   
(In the next rss-school task, you will use a full-fledged database that also can automatically remove child entities when the parent is deleted, verify keys ownership and instead of arrays for storing keys, you will use additional "join" tables)  

To determine that all your restful logic works correctly => run the script "npm run test".  
But be careful because these tests are integration (E.g. to test "delete" logic => it creates the entity via a "create" endpoint).  

### Description for the 2 task:  
You are free to create your own gql environment as long as you use predefined graphql endpoint (./src/routes/graphql/index.ts).  
(or stick to the [default code-first](https://github.dev/graphql/graphql-js/blob/ffa18e9de0ae630d7e5f264f72c94d497c70016b/src/__tests__/starWarsSchema.ts))  

### Description for the 3 task:
If you have chosen a non-default gql environment, then the connection of some functionality may differ, be sure to report this in the PR.  

### Description for the 4 task:  
If you have chosen a non-default gql environment, then the connection of some functionality may differ, be sure to report this in the PR.  
Limit the complexity of the graphql queries by their depth with "graphql-depth-limit" package.  
E.g. User can refer to other users via properties `userSubscribedTo`, `subscribedToUser` and users within them can also have `userSubscribedTo`, `subscribedToUser` and so on.  
Your task is to add a new rule (created by "graphql-depth-limit") in [validation](https://graphql.org/graphql-js/validation/) to limit such nesting to (for example) 6 levels max.
