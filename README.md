# Text -> URL List

Receive stdin, output a list of URLs.

## Arguments

```shell
-t --type : plaintext | html
```
Indicate whether STDIN is HTML or Plaintext.

```shell
-d --delimit : string
```
Provide a string (1+ characters) to use as a delimiter.
Be mindful not to use valid URL characters otherwise parsing the list will be difficult.

## Example

```shell
echo "check out https://deno.land it's cool!" | deno run mod.ts
```
Expected output:
```shell
https://deno.land
```

## Usage hints

### Use with your clipboard
Copy some links/content from a website, then:

```shell
xclip -o -t text/html -selection clipboard | deno run mod.ts --type html
```