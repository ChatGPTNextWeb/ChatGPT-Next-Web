<div align="center">
<img src="./docs/images/icon.svg" alt="预览"/>

<h1 align="center">ChatGPT Next Web</h1>

Implemente su aplicación web privada ChatGPT de forma gratuita con un solo clic.

[Demo demo](https://chat-gpt-next-web.vercel.app/) / [Problemas de comentarios](https://github.com/Yidadaa/ChatGPT-Next-Web/issues) / [Únete a Discord](https://discord.gg/zrhvHCr79N) / [Grupo QQ](https://user-images.githubusercontent.com/16968934/228190818-7dd00845-e9b9-4363-97e5-44c507ac76da.jpeg) / [Desarrolladores de consejos](https://user-images.githubusercontent.com/16968934/227772541-5bcd52d8-61b7-488c-a203-0330d8006e2b.jpg) / [Donar](#捐赠-donate-usdt)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web\&env=OPENAI_API_KEY\&env=CODE\&project-name=chatgpt-next-web\&repository-name=ChatGPT-Next-Web)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

![主界面](./docs/images/cover.png)

</div>

## Comenzar

1.  Prepara el tuyo [Clave API OpenAI](https://platform.openai.com/account/api-keys);
2.  Haga clic en el botón de la derecha para iniciar la implementación:
    [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web\&env=OPENAI_API_KEY\&env=CODE\&project-name=chatgpt-next-web\&repository-name=ChatGPT-Next-Web), inicie sesión directamente con su cuenta de Github y recuerde completar la clave API y la suma en la página de variables de entorno[Contraseña de acceso a la página](#配置页面访问密码) CÓDIGO;
3.  Una vez implementado, puede comenzar;
4.  (Opcional)[Enlazar un nombre de dominio personalizado](https://vercel.com/docs/concepts/projects/domains/add-a-domain): El nombre de dominio DNS asignado por Vercel está contaminado en algunas regiones y puede conectarse directamente enlazando un nombre de dominio personalizado.

## Manténgase actualizado

Si sigue los pasos anteriores para implementar su proyecto con un solo clic, es posible que siempre diga "La actualización existe" porque Vercel creará un nuevo proyecto para usted de forma predeterminada en lugar de bifurcar el proyecto, lo que evitará que la actualización se detecte correctamente.
Le recomendamos que siga estos pasos para volver a implementar:

*   Eliminar el repositorio original;
*   Utilice el botón de bifurcación en la esquina superior derecha de la página para bifurcar este proyecto;
*   En Vercel, vuelva a seleccionar e implementar,[Echa un vistazo al tutorial detallado](./docs/vercel-cn.md#如何新建项目)。

### Activar actualizaciones automáticas

> Si encuentra un error de ejecución de Upstream Sync, ¡Sync Fork manualmente una vez!

Cuando bifurca el proyecto, debido a las limitaciones de Github, debe ir manualmente a la página Acciones de su proyecto bifurcado para habilitar Flujos de trabajo y habilitar Upstream Sync Action, después de habilitarlo, puede activar las actualizaciones automáticas cada hora:

![自动更新](./docs/images/enable-actions.jpg)

![启用自动更新](./docs/images/enable-actions-sync.jpg)

### Actualizar el código manualmente

Si desea que el manual se actualice inmediatamente, puede consultarlo [Documentación para Github](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) Aprenda a sincronizar un proyecto bifurcado con código ascendente.

Puede destacar / ver este proyecto o seguir al autor para recibir notificaciones de nuevas actualizaciones de funciones.

## Configurar la contraseña de acceso a la página

> Después de configurar la contraseña, el usuario debe completar manualmente el código de acceso en la página de configuración para chatear normalmente, de lo contrario, se solicitará el estado no autorizado a través de un mensaje.

> **advertir**: Asegúrese de establecer el número de dígitos de la contraseña lo suficientemente largo, preferiblemente más de 7 dígitos, de lo contrario[Será volado](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/518)。

Este proyecto proporciona control de permisos limitado, agregue el nombre al nombre en la página Variables de entorno del Panel de control del proyecto Vercel `CODE` Variables de entorno con valores para contraseñas personalizadas separadas por comas:

    code1,code2,code3

Después de agregar o modificar la variable de entorno, por favor**Redesplegar**proyecto para poner en vigor los cambios.

## Variable de entorno

> La mayoría de los elementos de configuración de este proyecto se establecen a través de variables de entorno, tutorial:[Cómo modificar las variables de entorno de Vercel](./docs/vercel-cn.md)。

### `OPENAI_API_KEY` (Requerido)

OpanAI key, la clave API que solicita en la página de su cuenta openai.

### `CODE` (Opcional)

Las contraseñas de acceso, opcionalmente, se pueden separar por comas.

**advertir**: Si no completa este campo, cualquiera puede usar directamente su sitio web implementado, lo que puede hacer que su token se consuma rápidamente, se recomienda completar esta opción.

### `BASE_URL` (Opcional)

> Predeterminado: `https://api.openai.com`

> Ejemplos: `http://your-openai-proxy.com`

URL del proxy de interfaz OpenAI, complete esta opción si configuró manualmente el proxy de interfaz openAI.

> Si encuentra problemas con el certificado SSL, establezca el `BASE_URL` El protocolo se establece en http.

### `OPENAI_ORG_ID` (Opcional)

Especifica el identificador de la organización en OpenAI.

### `HIDE_USER_API_KEY` (Opcional)

Si no desea que los usuarios rellenen la clave de API ellos mismos, establezca esta variable de entorno en 1.

### `DISABLE_GPT4` (Opcional)

Si no desea que los usuarios utilicen GPT-4, establezca esta variable de entorno en 1.

### `Hide_Balance_Query` (Opcional)

Si no desea que los usuarios consulte el saldo, establezca esta variable de entorno en 1.

## explotación

> No se recomienda encarecidamente desarrollar o implementar localmente, debido a algunas razones técnicas, es difícil configurar el agente API de OpenAI localmente, a menos que pueda asegurarse de que puede conectarse directamente al servidor OpenAI.

Haga clic en el botón de abajo para iniciar el desarrollo secundario:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

Antes de empezar a escribir código, debe crear uno nuevo en la raíz del proyecto `.env.local` archivo, lleno de variables de entorno:

    OPENAI_API_KEY=<your api key here>

### Desarrollo local

1.  Instale nodejs 18 e hilo, pregunte a ChatGPT para obtener más detalles;
2.  ejecutar `yarn install && yarn dev` Enlatar. ⚠️ Nota: Este comando es solo para desarrollo local, no para implementación.
3.  Úselo si desea implementar localmente `yarn install && yarn start` comando, puede cooperar con pm2 a daemon para evitar ser asesinado, pregunte a ChatGPT para obtener más detalles.

## desplegar

### Implementación de contenedores (recomendado)

> La versión de Docker debe ser 20 o posterior, de lo contrario se indicará que no se puede encontrar la imagen.

> ⚠️ Nota: Las versiones de Docker están de 1 a 2 días por detrás de la última versión la mayor parte del tiempo, por lo que es normal que sigas diciendo "La actualización existe" después de la implementación.

```shell
docker pull yidadaa/chatgpt-next-web

docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY="sk-xxxx" \
   -e CODE="页面访问密码" \
   yidadaa/chatgpt-next-web
```

También puede especificar proxy:

```shell
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY="sk-xxxx" \
   -e CODE="页面访问密码" \
   --net=host \
   -e PROXY_URL="http://127.0.0.1:7890" \
   yidadaa/chatgpt-next-web
```

Si necesita especificar otras variables de entorno, agréguelas usted mismo en el comando anterior `-e 环境变量=环境变量值` para especificar.

### Implementación local

Ejecute el siguiente comando en la consola:

```shell
bash <(curl -s https://raw.githubusercontent.com/Yidadaa/ChatGPT-Next-Web/main/scripts/setup.sh)
```

⚠️ Nota: Si tiene problemas durante la instalación, utilice la implementación de Docker.

## Reconocimiento

### donante

> Ver versión en inglés.

### Colaboradores

[Ver la lista de colaboradores del proyecto](https://github.com/Yidadaa/ChatGPT-Next-Web/graphs/contributors)

## Licencia de código abierto

> Contra 996, empezando por mí.

[Licencia Anti 996](https://github.com/kattgu7/Anti-996-License/blob/master/LICENSE_CN_EN)
