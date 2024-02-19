# Instrucciones de uso de Verbel

## Cómo crear un nuevo proyecto

Cuando bifurca este proyecto desde Github y necesita crear un nuevo proyecto de Vercel en Vercel para volver a implementarlo, debe seguir los pasos a continuación.

![vercel-create-1](./images/vercel/vercel-create-1.jpg)

1.  Vaya a la página de inicio de la consola de Vercel;
2.  Haga clic en Agregar nuevo;
3.  Seleccione Proyecto.

![vercel-create-2](./images/vercel/vercel-create-2.jpg)

1.  En Import Git Repository, busque chatgpt-next-web;
2.  Seleccione el proyecto de la nueva bifurcación y haga clic en Importar.

![vercel-create-3](./images/vercel/vercel-create-3.jpg)

1.  En la página de configuración del proyecto, haga clic en Variables de entorno para configurar las variables de entorno;
2.  Agregar variables de entorno denominadas OPENAI_API_KEY y CODE;
3.  Rellenar los valores correspondientes a las variables de entorno;
4.  Haga clic en Agregar para confirmar la adición de variables de entorno;
5.  Asegúrese de agregar OPENAI_API_KEY, de lo contrario no funcionará;
6.  Haga clic en Implementar, créelo y espere pacientemente unos 5 minutos a que se complete la implementación.

## Cómo agregar un nombre de dominio personalizado

\[TODO]

## Cómo cambiar las variables de entorno

![vercel-env-edit](./images/vercel/vercel-env-edit.jpg)

1.  Vaya a la consola interna del proyecto Vercel y haga clic en el botón Configuración en la parte superior;
2.  Haga clic en Variables de entorno a la izquierda;
3.  Haga clic en el botón a la derecha de una entrada existente;
4.  Seleccione Editar para editarlo y, a continuación, guárdelo.

⚠️️ Nota: Lo necesita cada vez que modifique las variables de entorno[Volver a implementar el proyecto](#如何重新部署)para que los cambios surtan efecto!

## Cómo volver a implementar

![vercel-redeploy](./images/vercel/vercel-redeploy.jpg)

1.  Vaya a la consola interna del proyecto Vercel y haga clic en el botón Implementaciones en la parte superior;
2.  Seleccione el botón derecho del artículo superior de la lista;
3.  Haga clic en Volver a implementar para volver a implementar.
