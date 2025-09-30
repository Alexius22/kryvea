FROM golang:1.24.4-bookworm AS go-builder
WORKDIR /kryvea
COPY . .
RUN make

FROM alpine:3.21.2 AS kryvea
WORKDIR /etc/kryvea
WORKDIR /usr/bin
COPY --from=go-builder ./kryvea/build/kryvea .
ENTRYPOINT "/usr/bin/kryvea"