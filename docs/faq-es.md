# Preguntas frecuentes

## ¿Cómo puedo obtener ayuda rápidamente?

1.  Pregunte a ChatGPT / Bing / Baidu / Google, etc.
2.  Pregunte a los internautas. Sírvase proporcionar información general sobre el problema y una descripción detallada del problema encontrado. Las preguntas de alta calidad facilitan la obtención de respuestas útiles.

# Problemas relacionados con la implementación

Referencia tutorial detallada para varios métodos de implementación: https://rptzik3toh.feishu.cn/docx/XtrdduHwXoSCGIxeFLlcEPsdn8b

## ¿Por qué la versión de implementación de Docker sigue solicitando actualizaciones?

La versión de Docker es equivalente a la versión estable, la última versión de Docker es siempre la misma que la última versión de lanzamiento, y la frecuencia de lanzamiento actual es de uno a dos días, por lo que la versión de Docker siempre se retrasará con respecto a la última confirmación de uno a dos días, lo que se espera.

## Cómo implementar en Vercel

1.  Regístrese para obtener una cuenta de Github y bifurque el proyecto
2.  Regístrese en Vercel (se requiere verificación de teléfono móvil, puede usar un número chino) y conéctese a su cuenta de Github
3.  Cree un nuevo proyecto en Vercel, seleccione el proyecto que bifurcó en Github, complete las variables de entorno según sea necesario e inicie la implementación. Después de la implementación, puede acceder a su proyecto a través del nombre de dominio proporcionado por Vercel con una escalera.
4.  Si necesitas acceder sin muros en China: En tu sitio web de administración de dominios, agrega un registro CNAME para tu nombre de dominio que apunte a cname.vercel-dns.com. Después de eso, configure el acceso a su dominio en Vercel.

## Cómo modificar las variables de entorno de Vercel

*   Vaya a la página de la consola de Vercel;
*   Seleccione su siguiente proyecto web chatgpt;
*   Haga clic en la opción Configuración en el encabezado de la página;
*   Busque la opción Variables de entorno en la barra lateral;
*   Modifique el valor correspondiente.

## ¿Qué es la variable de entorno CODE? ¿Es obligatorio configurar?

Esta es su contraseña de acceso personalizada, puede elegir:

1.  Si no es así, elimine la variable de entorno. Precaución: Cualquier persona puede acceder a tu proyecto en este momento.
2.  Cuando implemente el proyecto, establezca la variable de entorno CODE (admite varias comas de contraseña separadas). Después de establecer la contraseña de acceso, debe ingresar la contraseña de acceso en la interfaz de configuración antes de poder usarla. Ver[Instrucciones relacionadas](https://github.com/Yidadaa/ChatGPT-Next-Web/blob/main/README_CN.md#%E9%85%8D%E7%BD%AE%E9%A1%B5%E9%9D%A2%E8%AE%BF%E9%97%AE%E5%AF%86%E7%A0%81)

## ¿Por qué la versión que implementé no transmite respuestas?

> Debates relacionados:[#386](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/386)

Si utiliza el proxy inverso nginx, debe agregar el siguiente código al archivo de configuración:

    # 不缓存，支持流式输出
    proxy_cache off;  # 关闭缓存
    proxy_buffering off;  # 关闭代理缓冲
    chunked_transfer_encoding on;  # 开启分块传输编码
    tcp_nopush on;  # 开启TCP NOPUSH选项，禁止Nagle算法
    tcp_nodelay on;  # 开启TCP NODELAY选项，禁止延迟ACK算法
    keepalive_timeout 300;  # 设定keep-alive超时时间为65秒

Si está implementando en Netlify y este problema aún está pendiente de resolución, tenga paciencia.

## Lo implementé, pero no puedo acceder a él

Marque para descartar los siguientes problemas:

*   ¿Se ha iniciado el servicio?
*   ¿Los puertos están asignados correctamente?
*   ¿El firewall está abriendo puertos?
*   ¿Es transitable la ruta al servidor?
*   ¿Se resuelve correctamente el nombre de dominio?

## ¿Qué es un proxy y cómo lo uso?

Debido a las restricciones de IP de OpenAI, China y algunos otros países no pueden conectarse directamente a las API de OpenAI y necesitan pasar por un proxy. Puede usar un servidor proxy (proxy de reenvío) o un proxy inverso de API OpenAI ya configurado.

*   Ejemplo de agente positivo: escalera científica de Internet. En el caso de la implementación de Docker, establezca la variable de entorno HTTP_PROXY en su dirección proxy (por ejemplo: 10.10.10.10:8002).
*   Ejemplo de proxy inverso: puede usar una dirección proxy creada por otra persona o configurarla de forma gratuita a través de Cloudflare. Establezca la variable de entorno del proyecto BASE_URL en su dirección proxy.

## ¿Se pueden implementar servidores domésticos?

Sí, pero hay que resolverlo:

*   Requiere un proxy para conectarse a sitios como GitHub y openAI;
*   Si el servidor doméstico desea configurar la resolución de nombres de dominio, debe registrarse;
*   Las políticas nacionales restringen el acceso proxy a las aplicaciones relacionadas con Internet/ChatGPT y pueden bloquearse.

## ¿Por qué recibo un error de red después de la implementación de Docker?

Ver Discusión: https://github.com/Yidadaa/ChatGPT-Next-Web/issues/1569 para más detalles

# Problemas relacionados con el uso

## ¿Por qué sigues diciendo "Algo salió mal, inténtalo de nuevo más tarde"?

Puede haber muchas razones, por favor solucione los problemas en orden:

*   Compruebe primero si la versión del código es la última versión, actualice a la última versión e inténtelo de nuevo;
*   Compruebe si la clave API está configurada correctamente y si el nombre de la variable de entorno debe estar en mayúsculas y subrayado;
*   Compruebe si la clave API está disponible;
*   Si aún no puede identificar el problema después de los pasos anteriores, envíe un nuevo problema en el campo de problema con el registro de tiempo de ejecución de Verbel o el registro de tiempo de ejecución de Docker.

## ¿Por qué la respuesta de ChatGPT es confusa?

Interfaz de configuración: uno de los elementos de configuración del modelo es `temperature`, si este valor es mayor que 1, entonces existe el riesgo de una respuesta confusa, simplemente vuelva a llamarlo a dentro de 1.

## Al usarlo, aparece "Ahora en un estado no autorizado, ingrese la contraseña de acceso en la pantalla de configuración"?

El proyecto establece la contraseña de acceso a través de la variable de entorno CODE. Cuando lo use por primera vez, debe ingresar el código de acceso en la configuración para usarlo.

## Use el mensaje "Excedió su cuota actual, ..."

Hay un problema con la API KEY. Saldo insuficiente.

# Problemas relacionados con el servicio de red

## ¿Qué es Cloudflare?

Cloudflare (CF) es un proveedor de servicios de red que proporciona CDN, administración de nombres de dominio, alojamiento de páginas estáticas, implementación de funciones de computación perimetral y más. Usos comunes: comprar y/o alojar su nombre de dominio (resolución, nombre de dominio dinámico, etc.), poner un CDN en su servidor (puede ocultar la IP de la pared), desplegar un sitio web (CF Pages). CF ofrece la mayoría de los servicios de forma gratuita.

## ¿Qué es Vercel?

Vercel es una plataforma global en la nube diseñada para ayudar a los desarrolladores a crear e implementar aplicaciones web modernas más rápido. Este proyecto, junto con muchas aplicaciones web, se puede implementar en Vercel de forma gratuita con un solo clic. Sin código, sin Linux, sin servidores, sin tarifas, sin agente API OpenAI. La desventaja es que necesita vincular el nombre de dominio para poder acceder a él sin muros en China.

## ¿Cómo obtengo un nombre de dominio?

1.  Vaya al proveedor de nombres de dominio para registrarse, hay Namesilo (soporte Alipay), Cloudflare, etc. en el extranjero, y hay Wanwang en China;
2.  Proveedores de nombres de dominio gratuitos: eu.org (nombre de dominio de segundo nivel), etc.;
3.  Pídale a un amigo un nombre de dominio de segundo nivel gratuito.

## Cómo obtener un servidor

*   Ejemplos de proveedores de servidores extranjeros: Amazon Cloud, Google Cloud, Vultr, Bandwagon, Hostdare, etc.
    Asuntos de servidores extranjeros: Las líneas de servidor afectan las velocidades de acceso nacional, se recomiendan los servidores de línea CN2 GIA y CN2. Si el servidor es de difícil acceso en China (pérdida grave de paquetes, etc.), puede intentar configurar un CDN (Cloudflare y otros proveedores).
*   Proveedores de servidores nacionales: Alibaba Cloud, Tencent, etc.;
    Asuntos de servidores nacionales: La resolución de nombres de dominio requiere la presentación de ICP; El ancho de banda del servidor doméstico es más caro; El acceso a sitios web extranjeros (Github, openAI, etc.) requiere un proxy.

## ¿En qué circunstancias debe grabarse el servidor?

Los sitios web que operan en China continental deben presentar de acuerdo con los requisitos reglamentarios. En la práctica, si el servidor está ubicado en China y hay resolución de nombres de dominio, el proveedor del servidor implementará los requisitos reglamentarios de presentación, de lo contrario el servicio se cerrará. Las reglas habituales son las siguientes:
|ubicación del servidor|proveedor de nombres de dominio|si se requiere la presentación|
|---|---|---|
|Doméstico|Doméstico|Sí|
|nacional|extranjero|sí|
|extranjero|extranjero|no|
|extranjero|nacional|normalmente no|

Después de cambiar de proveedor de servidores, debe transferir la presentación de ICP.

# Problemas relacionados con OpenAI

## ¿Cómo registro una cuenta OpenAI?

Vaya a chat.openai.com para registrarse. Es necesario:

*   Una buena escalera (OpenAI admite direcciones IP nativas regionales)
*   Un buzón compatible (por ejemplo, Gmail o trabajo/escuela, no buzón de Outlook o QQ)
*   Cómo recibir autenticación por SMS (por ejemplo, sitio web de activación de SMS)

## ¿Cómo activo la API de OpenAI? ¿Cómo verifico mi saldo de API?

Dirección del sitio web oficial (se requiere escalera): https://platform.openai.com/account/usage
Algunos internautas han construido un agente de consulta de saldo sin escalera, por favor pídales a los internautas que lo obtengan. Identifique si la fuente es confiable para evitar la fuga de la clave API.

## ¿Por qué mi cuenta OpenAI recién registrada no tiene un saldo API?

(Actualizado el 6 de abril) Las cuentas recién registradas suelen mostrar el saldo de la API después de 24 horas. Se otorga un saldo de $ 5 a una cuenta recién registrada.

## ¿Cómo puedo recargar la API de OpenAI?

OpenAI solo acepta tarjetas de crédito en regiones seleccionadas (no se pueden usar tarjetas de crédito chinas). Algunos ejemplos de avenidas son:

1.  Depay tarjeta de crédito virtual
2.  Solicitar una tarjeta de crédito extranjera
3.  Encuentra a alguien para cobrar en línea

## ¿Cómo utilizo el acceso a la API de GPT-4?

*   El acceso a la API para GPT-4 requiere una solicitud independiente. Ingrese a la cola de la solicitud completando su información en la lista de espera (prepare su ID de organización OpenAI): https://openai.com/waitlist/gpt-4-api
    Espere el mensaje de correo después.
*   Habilitar ChatGPT Plus no significa permisos GPT-4, y los dos no tienen nada que ver entre sí.

## Uso de la interfaz de Azure OpenAI

Por favor consulte:[#371](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/371)

## ¿Por qué mi token se agota tan rápido?

> Debates relacionados:[#518](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/518)

*   Si tiene permisos de GPT 4 y usa las API de GPT 4 a diario, el monto de su factura aumentará rápidamente porque el precio de GPT 4 es aproximadamente 15 veces mayor que el de GPT 3.5;
*   Si está usando GPT 3.5 y no lo usa con mucha frecuencia y aún nota que su factura aumenta rápidamente, siga estos pasos para solucionar problemas ahora:
    *   Vaya al sitio web oficial de OpenAI para verificar sus registros de consumo de API Key, si su token se consume cada hora y se consumen decenas de miles de tokens cada vez, entonces su clave debe haberse filtrado, elimine y regenere inmediatamente.**No verifique su saldo en un sitio web desordenado.**
    *   Si su contraseña se acorta, como letras dentro de 5 dígitos, entonces el costo de voladura es muy bajo, se recomienda que busque en el registro de Docker para ver si alguien ha probado muchas combinaciones de contraseñas, palabra clave: got access code
*   A través de los dos métodos anteriores, puede localizar la razón por la cual su token se consume rápidamente:
    *   Si el registro de consumo de OpenAI es anormal, pero no hay ningún problema con el registro de Docker, entonces la clave API se filtra;
    *   Si el registro de Docker encuentra una gran cantidad de registros de código de acceso de obtención, entonces la contraseña ha sido destruida.

## ¿Cómo se facturan las API?

Instrucciones de facturación del sitio web de OpenAI: https://openai.com/pricing#language-models\
OpenAI cobra en función del número de tokens, y 1,000 tokens generalmente representan 750 palabras en inglés o 500 caracteres chinos. Prompt y Completion cuentan los costos por separado.\
|Modelo|Facturación de entrada de usuario (aviso)|Facturación de salida del modelo (finalización)|Número máximo de tokens por interacción|
|----|----|----|----|
|gpt-3.5|$0.002 / 1 mil tokens|$0.002 / 1 mil tokens|4096|
|gpt-4|$0.03 / 1 mil tokens|$0.06 / 1 mil tokens|8192|
|gpt-4-32K|$0.06 / 1 mil tokens|$0.12 / 1 mil tokens|32768|

## ¿Cuál es la diferencia entre los modelos GPT-3.5-TURBO y GPT3.5-TURBO-0301 (o GPT3.5-TURBO-MMDD)?

Descripción de la documentación oficial: https://platform.openai.com/docs/models/gpt-3-5

*   GPT-3.5-Turbo es el último modelo y se actualiza constantemente.
*   GPT-3.5-turbo-0301 es una instantánea del modelo congelada el 1 de marzo, no cambiará y se espera que sea reemplazada por una nueva instantánea en 3 meses.
