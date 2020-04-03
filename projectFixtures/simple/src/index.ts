// import * as https from 'https' <- this import statement will crash the compiler somehow :thinking_face:

function say(input: 'fuga') {
  console.log(input)
}

// say('hello')

const hoge = 'hoge'
hoge = 'fuga'

const fuga = 'fuga'
fuga = 'hoge'
