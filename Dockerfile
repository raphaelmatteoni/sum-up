# use official Golang image
FROM golang:latest

# set working directory
WORKDIR /app

# Copy the source code
COPY . . 

# Download and install the dependencies
RUN go get -d -v ./...

# Build the Go app
RUN go build -o sumup .

#EXPOSE the port
EXPOSE 8000

# Run the executable
CMD ["./sumup"]