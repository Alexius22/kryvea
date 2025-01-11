FROM golang:1.23.4-bookworm AS go-builder
WORKDIR /kryvea
COPY . .
RUN make

FROM alpine:3.21.2 AS kryvea
ENV KRYVEA_CONFIG_PATH="/etc/kryvea/kryvea.yml"
WORKDIR /etc/kryvea
COPY ./assets/kryvea.yml .
WORKDIR /usr/bin
COPY --from=go-builder ./kryvea/build/kryvea .
ENTRYPOINT ["/usr/bin/kryvea", "/etc/kryvea/kryvea.yml"]