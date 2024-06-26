import { Elysia, t } from "elysia";

let TODOS = [
  {
    id: 1,
    name: "shamim",
    starred: false,
    completed: false,
    desc: 'Wake up at 5am'
  },
  {
    id: 2,
    name: "imon",
    starred: false,
    completed: false,
    desc: 'Wake up at 5am'
  },
  {
    id: 3,
    name: "ahmed",
    starred: false,
    completed: false,
    desc: 'Brush your teeth'
  }
]

const app = new Elysia()
    .state('id', TODOS.length)
    .get("/", () => "Hello Elysia")
    .get("/home", () => "Hello Home")
    .get("todos", ({set}) => {
        set.status = 202
        return TODOS
    })
    .get('/jsons', () => ({
      hi: 'Elysia'
  }))
    .get("/todos/admin/*", ({params}) => params["*"])
    .get(
      "/todos/:id", 
      ({params, set, error}) => {
          const todo = TODOS.filter((todo) => todo.id === params.id)
          if(Array.isArray(todo) && todo.length === 0) {
            set.redirect = 'https://www.youtube.com/watch?v=1Max9huISzA&list=PLgH5QX0i9K3r6ZGeyFnSv_YDxVON2P85m&index=11'
          }
          return todo;
      },
      {
          params: t.Object({
            id: t.Numeric()
          })
      }
    )
    .get(
      "/todos/:id/:name", 
      ({params, set, error}) => {
          const todo = TODOS.filter((todo) => todo.id === params.id && todo.name === params.name)
          if(!todo) {
            return error(404);
          }
          set.status = 203
          return todo;
      },
      {
          params: t.Object({
            id: t.Numeric(),
            name: t.String()
          })
      }
    )
    .post(
      '/todos', 
      ({body, set, store, error}) => {
          store.id++
          const newTodo = {id: store.id, starred: false, completed: false, ...body}
          TODOS = [...TODOS, newTodo]
          set.status = 202
          return TODOS;
      },
      {
        body: t.Object({
          name: t.String(),
          desc: t.String({
            minLength: 3,
            maxLength: 255,
            error: `Description must be 3-255 characters.`
          })
        }),
      }
    )
    .put(
      '/todos/:id',
      ({params, body, set, error}) => {
          let myTodo = {id: params.id, ...body}
          const updatedTodos = TODOS.map((todo) => {
              if(todo.id === params.id) {
                  todo = {...myTodo}
              }
              return todo
          })
          TODOS = [...updatedTodos]
          if(!myTodo) {
              return error(404, 'Not Found Resource')
          }
          set.status = 202
          return myTodo
      },
      {
        params: t.Object({
            id: t.Numeric()
        }),
        body: t.Object({
          name: t.String(),
          starred: t.Boolean(),
          completed: t.Boolean(),
          desc: t.String({
            minLength: 3,
            maxLength: 255,
            error: `Description must be 3-255 characters.`
          })
        }),
      }
    )
    // PATCH endpoint for updating a todo
    .patch(
      ('/todos/:id/name'),
      ({ params, body, set, error }) => {
        const todoId = params.id
        const updatedTodoIndex = TODOS.findIndex(todo => todo.id === todoId)

        if (updatedTodoIndex === -1) {
          return error(404, 'Todo Not Found')
        }
        
        TODOS[updatedTodoIndex] = { ...TODOS[updatedTodoIndex], ...body }

        set.status = 200;
        return TODOS[updatedTodoIndex]
      },
      {
        params: t.Object({
          id: t.Numeric()
        }),
        body: t.Object({
          // Define the properties that can be updated in the body
          name: t.String()
        }),
      }
    )
    .patch(
      '/todos/:id/desc',
      ({ params, body, set, error }) => {
        const todoId = params.id
        const updatedTodoIndex = TODOS.findIndex(todo => todo.id === todoId)

        if (updatedTodoIndex === -1) {
          return error(404, 'Todo Not Found')
        }
        
        TODOS[updatedTodoIndex] = { ...TODOS[updatedTodoIndex], ...body }

        set.status = 200;
        return TODOS[updatedTodoIndex]
      },
      {
        params: t.Object({
          id: t.Numeric()
        }),
        body: t.Object({
          // Define the properties that can be updated in the body
          desc: t.String()
        }),
      }
    )
    .delete(
      '/todos/:id',
      ({params, error, set}) => {
        const newTodos = TODOS.filter((todo) => todo.id !== params.id)
        if(newTodos.length === TODOS.length) {
          set.status = 404
          return error(404, 'Todo Not Found')
        }
        TODOS = [...newTodos]
        set.status = 200
        return TODOS
      },
      {
        params: t.Object({
          id: t.Numeric()
        })
      }
      
    )
    .onError(({code}) =>{
      if(code === 'NOT_FOUND') 
          return 'Route not Found ;('
    })
    .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
