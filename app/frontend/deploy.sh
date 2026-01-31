#!/bin/bash

# Script de deploy para produção do JIBCA Frontend
# Uso: ./deploy.sh [environment]

set -e

# Configurações
ENVIRONMENT=${1:-production}
PROJECT_NAME="jibca-frontend"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a $LOG_FILE
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
}

# Verificar pré-requisitos
check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js não encontrado. Instale Node.js 18+ antes de continuar."
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        log_error "npm não encontrado. Instale npm antes de continuar."
        exit 1
    fi
    
    # Verificar Docker (se usando containerização)
    if command -v docker &> /dev/null; then
        log_info "Docker encontrado - deploy com containerização disponível"
    else
        log_warning "Docker não encontrado - usando deploy tradicional"
    fi
    
    log_success "Pré-requisitos verificados"
}

# Backup da versão atual
backup_current() {
    if [ -d "dist" ]; then
        log_info "Fazendo backup da versão atual..."
        mkdir -p $BACKUP_DIR
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" dist/
        log_success "Backup criado: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
    fi
}

# Instalar dependências
install_dependencies() {
    log_info "Instalando dependências..."
    npm ci --only=production
    log_success "Dependências instaladas"
}

# Build da aplicação
build_application() {
    log_info "Construindo aplicação para $ENVIRONMENT..."
    
    # Limpar build anterior
    npm run clean
    
    # Build
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build
    else
        npm run build:dev
    fi
    
    log_success "Build concluído"
}

# Executar testes
run_tests() {
    log_info "Executando testes..."
    
    # Lint
    npm run lint
    
    # Testes unitários (se existirem)
    if npm run test --silent 2>/dev/null; then
        npm run test
    else
        log_warning "Testes não configurados - pulando"
    fi
    
    log_success "Testes concluídos"
}

# Deploy com Docker
deploy_docker() {
    log_info "Iniciando deploy com Docker..."
    
    # Build da imagem
    docker build -t $PROJECT_NAME:latest .
    
    # Deploy usando docker-compose
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        log_error "docker-compose.prod.yml não encontrado"
        exit 1
    fi
    
    log_success "Deploy Docker concluído"
}

# Deploy tradicional
deploy_traditional() {
    log_info "Iniciando deploy tradicional..."
    
    # Verificar se existe servidor web configurado
    if command -v nginx &> /dev/null; then
        log_info "Nginx encontrado - copiando arquivos..."
        
        # Backup do nginx atual
        if [ -d "/var/www/jibca" ]; then
            sudo cp -r /var/www/jibca /var/www/jibca.backup.$(date +%s)
        fi
        
        # Copiar novos arquivos
        sudo mkdir -p /var/www/jibca
        sudo cp -r dist/* /var/www/jibca/
        
        # Reiniciar nginx
        sudo systemctl reload nginx
        
        log_success "Deploy tradicional concluído"
    else
        log_warning "Servidor web não detectado - arquivos disponíveis em ./dist/"
    fi
}

# Verificar saúde da aplicação
health_check() {
    log_info "Verificando saúde da aplicação..."
    
    # Aguardar alguns segundos para a aplicação iniciar
    sleep 5
    
    # Verificar se a aplicação está respondendo
    if command -v curl &> /dev/null; then
        if curl -f http://localhost/ &> /dev/null; then
            log_success "Aplicação está respondendo corretamente"
        else
            log_error "Aplicação não está respondendo"
            exit 1
        fi
    else
        log_warning "curl não encontrado - verificação manual necessária"
    fi
}

# Limpeza pós-deploy
cleanup() {
    log_info "Executando limpeza..."
    
    # Remover arquivos temporários
    rm -rf node_modules/.cache
    
    # Manter apenas os 5 backups mais recentes
    if [ -d "$BACKUP_DIR" ]; then
        ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +6 | xargs -r rm
    fi
    
    log_success "Limpeza concluída"
}

# Função principal
main() {
    log_info "=== Iniciando deploy do JIBCA Frontend ==="
    log_info "Ambiente: $ENVIRONMENT"
    log_info "Timestamp: $(date)"
    
    # Executar etapas do deploy
    check_prerequisites
    backup_current
    install_dependencies
    run_tests
    build_application
    
    # Escolher método de deploy
    if command -v docker &> /dev/null && [ -f "Dockerfile" ]; then
        deploy_docker
    else
        deploy_traditional
    fi
    
    health_check
    cleanup
    
    log_success "=== Deploy concluído com sucesso! ==="
}

# Tratamento de erros
trap 'log_error "Deploy falhou na linha $LINENO"' ERR

# Executar deploy
main "$@"