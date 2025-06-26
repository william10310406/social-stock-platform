# syntax=docker/dockerfile:1.4
FROM archlinux:base

# ---------------------------
# StockOS cross-compile image
# ---------------------------
# Installs x86_64-elf GCC, NASM, Limine, GRUB tools, QEMU.
# Used for building ISO and running tests in CI/local.

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

RUN pacman -Sy --noconfirm archlinux-keyring && \
    pacman -S --noconfirm \
        base-devel \
        git \
        nasm \
        clang llvm lld \
        libxml2 libarchive \
        qemu-base \
        grub \
        python && \
    pacman -Scc --noconfirm

# Build & install limine (bootloader)
RUN git clone --depth 1 --branch v9.3.4-binary https://github.com/limine-bootloader/limine.git /opt/limine && \
    make -C /opt/limine && \
    ln -s /opt/limine/limine-install /usr/local/bin/limine-install

ENV CROSS_COMPILE=x86_64-elf-
ENV PATH="/opt/limine:$PATH"

WORKDIR /workspace

CMD ["/bin/bash"] 