@echo off
echo ========================================
echo Testando CRUD de Estabelecimentos
echo ========================================

echo.
echo 1. Testando READ (Listar todos)...
curl -X GET http://localhost:3333/api/estabelecimentos

echo.
echo 2. Testando READ (Buscar por tipo)...
curl -X GET http://localhost:3333/api/estabelecimentos/tipo/Restaurante

echo.
echo 3. Testando READ (Buscar por proximidade)...
curl -X GET "http://localhost:3333/api/estabelecimentos/proximos?lat=-6.89&lng=-38.56&raio=5"

echo.
echo 4. Testando CREATE (sem autenticação - deve falhar)...
curl -X POST http://localhost:3333/api/estabelecimentos ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Teste\",\"tipo\":\"Restaurante\",\"categoria\":\"Teste\",\"descricao\":\"Teste\",\"endereco\":{\"rua\":\"Teste\",\"numero\":\"123\",\"bairro\":\"Teste\",\"cep\":\"58900-000\"},\"localizacao\":{\"latitude\":-6.89,\"longitude\":-38.56},\"contato\":{\"telefone\":\"(83) 3531-1234\"}}"

echo.
echo ========================================
echo Testes concluidos!
echo ========================================
echo.
echo Notas:
echo - Para CREATE, UPDATE e DELETE, faca login como admin primeiro
echo - Use: curl -X POST http://localhost:3333/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"senha\":\"123456\"}"
echo - Copie o token retornado e use no header Authorization: Bearer TOKEN
echo.
pause
