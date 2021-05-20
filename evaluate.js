const TOKEN_NUMBER = "NUMBER";
const TOKEN_PLUS = "PLUS";
const TOKEN_MINUS = "MINUS";
const TOKEN_SLASH = "SLASH";
const TOKEN_STAR = "STAR";
const TOKEN_OPEN_PAREN = "OPEN_PAREN";
const TOKEN_CLOSE_PAREN = "CLOSE_PAREN";
const TOKEN_OPEN_BRACKET = "OPEN_BRACKET";
const TOKEN_CLOSE_BRACKET = "CLOSE_BRACKET";
const TOKEN_OPEN_BRACE = "OPEN_BRACE";
const TOKEN_CLOSE_BRACE = "CLOSE_BRACE";
const TOKEN_UNKNOWN = "UNKNOWN";

function str_to_tokens(str)
{
    const tokens = [];

    for(let i=0; i< str.length; i++)
    {
        const char = str.charAt(i);

        if (/[0-9]/.test(char)) 
        {
           let number = char;
           while(i+1 < str.length)
           {
                let char = str.charAt(i+1);
                if (!/[0-9]/.test(char))break;
                number += char;
                i++;                
           } 
           tokens.push({
               type: TOKEN_NUMBER,
               number: parseInt(number)
           });
        }
        else if(/\+/.test(char))
        {
            tokens.push({
                type:TOKEN_PLUS,
            });
        }
        else if(/\-/.test(char))
        {
            tokens.push({
                type:TOKEN_MINUS,
            });
        }
        else if(/\*/.test(char))
        {
            tokens.push({
                type:TOKEN_STAR,
            });
        }
        else if(/\//.test(char))
        {
            tokens.push({
                type:TOKEN_SLASH,
            });
        }
        else if(/\(/.test(char))
        {
            tokens.push({
                type:TOKEN_OPEN_PAREN,
            });
        }
        else if(/\)/.test(char))
        {
            tokens.push({
                type:TOKEN_CLOSE_PAREN,
            });
        }
        else if(/\[/.test(char))
        {
            tokens.push({
                type:TOKEN_OPEN_BRACKET,
            });
        }
        else if(/\]/.test(char))
        {
            tokens.push({
                type:TOKEN_CLOSE_BRACKET,
            });
        }
        else if(/\{/.test(char))
        {
            tokens.push({
                type:TOKEN_OPEN_BRACE,
            });
        }
        else if(/\}/.test(char))
        {
            tokens.push({
                type:TOKEN_CLOSE_BRACE,
            });
        }
        else if(/[ \r\t\n]/.test(char))
        {
           // Whitespace ignored
        }
        else
        {
            tokens.push({
                type: TOKEN_UNKNOWN,
            });
        }
        
    }
    return tokens;
}


function token(parser) 
{
    return parser.tokens.length && parser.current_token < parser.tokens.length ? parser.tokens[parser.current_token] : null;  
}
function next_token(parser)
{
    const result = token(parser);
    parser.current_token++;
    return result;    
}
function token_is(parser, type)
{
    return token(parser) && token(parser).type == type;    
}
function parse_number(parser)
{
    if (token_is(parser, TOKEN_NUMBER))
    {
        return {
            type: AST_NUMBER,
            number: next_token(parser),        
        };   
    }
    else if (token_is(parser, TOKEN_OPEN_PAREN))
    {
        next_token(parser);
        const result = parse_expression(parser);
        if (token_is(parser, TOKEN_CLOSE_PAREN))
        {
            next_token(parser);
            return result;
        }
        else
        {
            // Error
        }
    }
    else if (token_is(parser, TOKEN_OPEN_BRACKET))
    {
        next_token(parser);
        const result = parse_expression(parser);
        if (token_is(parser, TOKEN_CLOSE_BRACKET))
        {
            next_token(parser);
            return result;
        }
        else
        {
            // Error
        }
    }
    else if (token_is(parser, TOKEN_OPEN_BRACE))
    {
        next_token(parser);
        const result = parse_expression(parser);
        if (token_is(parser, TOKEN_CLOSE_BRACE))
        {
            next_token(parser);
            return result;
        }
        else
        {
            // Error
        }
    }
    else
    {
        return null;
    }
}

const AST_NUMBER = "AST_NUMBER";
const AST_BIN_OPERATOR = "AST_BIN_OPERATOR";
function parse_multiplication(parser) 
{
    let result = parse_number(parser);
    while (token_is(parser, TOKEN_SLASH) || token_is(parser, TOKEN_STAR))
    {
        const operator = next_token(parser);
        let right_operand = parse_number(parser);
        if (!right_operand) 
        {
            return null;    
        }
        result = {
            type: AST_BIN_OPERATOR,
            operator: operator,
            left: result,
            right: right_operand,
        }   
    } 
    return result;   
}

function parse_addition(parser) 
{
    let result = parse_multiplication(parser);
    while (token_is(parser, TOKEN_PLUS) || token_is(parser, TOKEN_MINUS))
    {
        const operator = next_token(parser);
        let right_operand = parse_multiplication(parser);
        if (!right_operand) 
        {
            return null;    
        }
        result = {
            type: AST_BIN_OPERATOR,
            operator: operator,
            left: result,
            right: right_operand,
        }   
    } 
    return result;   
}

function parse_expression(parser)
{
    return parse_addition(parser);
}

function evaluate_ast(ast) 
{
    if (ast.type == AST_BIN_OPERATOR) 
    {
        const left = evaluate_ast(ast.left);
        const right = evaluate_ast(ast.right);
        if (ast.operator.type == TOKEN_PLUS) 
        {
            return left + right;    
        }
        else if (ast.operator.type == TOKEN_MINUS) 
        {
            return left - right;            
        }
        else if (ast.operator.type == TOKEN_STAR) 
        {
            return left * right;            
        }
        else if (ast.operator.type == TOKEN_SLASH) 
        {
            return left / right;            
        }
        else
        {
            console.log("UNKNOWN OPERATOR", ast.operator.type)
        }
    }
    else if (ast.type == AST_NUMBER)
    {
        return ast.number.number;    
    }
    else
    {
        console.log("UNKNOWN",ast);
    }    
}




/* Teext Reader*/


function evaluate()
{
    const readline = require("readline"),
    fs = require("fs"),
    name_at = "archivo.txt";
    let lector = readline.createInterface({
    input: fs.createReadStream(name_at)
   });
   
    lector.on("line", linea => {
    const input_expression = linea;
    
    const tokens = str_to_tokens(input_expression);
    const parser = {
        tokens: tokens,
        current_token:0,
    };
    const ast = parse_expression(parser);

    let output_text = "";

    if(ast)
    { 
        output_text = evaluate_ast(ast);
    }
    else{
        output_text = "Syntax Error";
    }
    console.log(output_text);
   });
}
evaluate();

